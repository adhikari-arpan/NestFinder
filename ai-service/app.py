# ai-service/app.py
# Content-based room recommendation using sentence embeddings.
# Run standalone: python app.py  (listens on :5001, matching your
# existing three-service architecture: React 3000 / Express 5000 / Flask 5001)

import os
import numpy as np
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util
from supabase import create_client

load_dotenv()

app = Flask(__name__)
CORS(app)  # allow requests from the Vite dev server (localhost:5173/3000)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Loaded once at process startup. This is the expensive step (downloads
# ~80MB the first time, then loads from cache) — keep it out of the
# request path or every call would be painfully slow.
print("Loading sentence-transformer model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("Model loaded.")

# -----------------------------------------------------------------------------
# Embedding cache (FIX 1)
# -----------------------------------------------------------------------------
# Maps listing_id -> (document_text, embedding). Listing embeddings only need
# to be recomputed when the listing's text actually changes, so per-request
# cost drops from O(n) model calls to just one query encoding. The document
# text is stored alongside the embedding so edited listings are detected and
# re-encoded automatically.
embedding_cache = {}


def get_listing_embeddings(listings):
    """Encode only listings that are new or whose text changed.
    Returns a 2D numpy array of embeddings aligned with the listings list."""
    docs = [listing_to_document(l) for l in listings]
    to_encode = []
    to_encode_idx = []

    for i, (l, doc) in enumerate(zip(listings, docs)):
        cached = embedding_cache.get(l["id"])
        if cached is None or cached[0] != doc:  # new or edited listing
            to_encode.append(doc)
            to_encode_idx.append(i)

    if to_encode:
        new_embs = model.encode(to_encode, convert_to_tensor=False)
        for idx, emb in zip(to_encode_idx, new_embs):
            embedding_cache[listings[idx]["id"]] = (docs[idx], np.array(emb))

    return np.array([embedding_cache[l["id"]][1] for l in listings])


def fetch_verified_listings():
    """Pull verified listings plus their nearby POIs, same source of
    truth as the React app."""
    response = (
        supabase.table("listings_with_rating")
        .select("*, listing_pois(name, type, distance_meters)")
        .eq("status", "verified")
        .execute()
    )
    return response.data or []


def listing_to_document(listing):
    """Turn a listing row into a natural-language string for embedding.
    The richer and more natural this text is, the better the semantic
    matches — this is the single highest-leverage thing to tune here."""
    poi_names = ", ".join(p["name"] for p in listing.get("listing_pois", []))
    amenities = ", ".join(listing.get("amenities", []))
    return (
        f"{listing['type']} in {listing['city']}, {listing['location']}. "
        f"{listing['sharing']} sharing. Rent {listing['price']} rupees per month. "
        f"{listing['title']}. {listing.get('description', '')}. "
        f"Amenities: {amenities}. Nearby: {poi_names}."
    )


def preferences_to_query(prefs):
    """Turn the tenant's structured preference object (same shape as
    tenantPreferences in AppContext) into a matching natural-language
    string, so it lands in the same embedding space as listing documents."""
    amenities = ", ".join(prefs.get("essentialAmenities", []))
    parts = [
        f"{prefs.get('roomType', 'Room')} in {prefs.get('preferredCity', '')}.",
        f"{prefs.get('sharing', '')} sharing preferred.",
        f"Budget around {prefs.get('budget', '')} rupees per month.",
    ]
    if amenities:
        parts.append(f"Needs amenities: {amenities}.")
    if prefs.get("poiCollege"):
        parts.append(f"Close to {prefs['poiCollege']}.")
    return " ".join(parts)


def compute_hybrid_score(listing, prefs, semantic_score):
    # Each factor 0..1, same philosophy as your JS rule-based scorer

    # Budget
    budget = prefs.get("budget")
    if budget:
        if listing["price"] <= budget:
            budget_score = 1.0
        else:
            over_pct = (listing["price"] - budget) / budget
            budget_score = max(0.0, 1 - over_pct * 1.5)
    else:
        budget_score = 0.5

    # City
    city_score = 1.0 if prefs.get("preferredCity") and \
        listing["city"].lower() == prefs["preferredCity"].lower() else 0.0

    # Sharing
    sharing_score = 1.0 if prefs.get("sharing") and \
        listing["sharing"] == prefs["sharing"] else 0.0

    # Room type (FIX 3) — mirrors the JS rule-based scorer, which checks
    # type but was missing from the hybrid score
    room_type_score = 1.0 if prefs.get("roomType") and \
        listing["type"] == prefs["roomType"] else 0.0

    # Amenities — explicit overlap, not left to the embedding to "guess"
    wanted = prefs.get("essentialAmenities", [])
    have = listing.get("amenities", [])
    amenity_score = (len(set(wanted) & set(have)) / len(wanted)) if wanted else 1.0

    # Proximity — same logic as your JS proximityInfo version
    proximity_score = 0.5
    radius = prefs.get("radius", 1000)
    poi_college = prefs.get("poiCollege")
    if poi_college:
        match = next((p for p in listing.get("listing_pois", [])
                       if p["type"] == "College" and
                       (poi_college.lower() in p["name"].lower() or
                        p["name"].lower() in poi_college.lower())), None)
        if match:
            dist = match["distance_meters"]
            if dist <= radius:
                proximity_score = 1 - dist / radius
            else:
                over_by = dist - radius
                proximity_score = max(0.0, 0.3 - (over_by / radius) * 0.3)
        else:
            proximity_score = 0.0

    # Weights rebalanced to make room for roomType — still sum to 1.0
    weights = {
        "semantic": 0.30,   # the AI's contribution: overall descriptive fit
        "budget": 0.20,
        "amenity": 0.15,
        "proximity": 0.15,
        "city": 0.10,
        "roomType": 0.05,
        "sharing": 0.05,
    }

    final = (
        weights["semantic"] * semantic_score +
        weights["budget"] * budget_score +
        weights["amenity"] * amenity_score +
        weights["proximity"] * proximity_score +
        weights["city"] * city_score +
        weights["roomType"] * room_type_score +
        weights["sharing"] * sharing_score
    )

    return final, {
        "semantic": round(semantic_score * 100, 1),
        "budget": round(budget_score * 100, 1),
        "amenity": round(amenity_score * 100, 1),
        "proximity": round(proximity_score * 100, 1),
        "city": round(city_score * 100, 1),
        "roomType": round(room_type_score * 100, 1),
        "sharing": round(sharing_score * 100, 1),
    }

# -----------------------------------------------------------------------------
# Maximal Marginal Relevance Algorithm (MMR) for diversity in recommendations.
# -----------------------------------------------------------------------------
def mmr_rerank(listings, scores, embeddings, top_k=10, diversity_weight=0.3):
    """
    Re-ranks results to balance relevance (match score) against diversity
    (avoiding near-duplicate listings). This is Maximal Marginal Relevance —
    a standard technique in recommendation/search systems to prevent the
    top results from all being near-identical.
    """
    selected_idx = []
    remaining_idx = list(range(len(listings)))

    # Normalize embeddings for cosine similarity between listings themselves
    norm_embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)

    while remaining_idx and len(selected_idx) < top_k:
        best_idx = None
        best_mmr = -float("inf")

        for idx in remaining_idx:
            relevance = scores[idx]

            if selected_idx:
                # How similar is this listing to ones we've already picked?
                sims_to_selected = [
                    float(np.dot(norm_embeddings[idx], norm_embeddings[j]))
                    for j in selected_idx
                ]
                max_similarity = max(sims_to_selected)
            else:
                max_similarity = 0.0

            # Reward high match score, penalize similarity to already-picked items
            mmr_score = (1 - diversity_weight) * relevance - diversity_weight * max_similarity

            if mmr_score > best_mmr:
                best_mmr = mmr_score
                best_idx = idx

        selected_idx.append(best_idx)
        remaining_idx.remove(best_idx)

    return selected_idx

# -----------------------------------------------------------------------------
# Blend With History (This function makes recommendation better by analysing the user saved rooms)
# -----------------------------------------------------------------------------
def blend_with_history(query_embedding, history_embeddings, alpha=0.25):
    """
    Blends the tenant's stated-preference embedding with the average
    embedding of listings they've previously saved. alpha controls how
    much weight past behavior gets (0 = ignore history, 1 = ignore form).
    """
    if not history_embeddings:
        return query_embedding

    history_avg = np.mean(history_embeddings, axis=0)
    history_avg = history_avg / np.linalg.norm(history_avg)

    query_np = query_embedding.cpu().numpy() if hasattr(query_embedding, "cpu") else np.array(query_embedding)
    blended = (1 - alpha) * query_np + alpha * history_avg
    blended = blended / np.linalg.norm(blended)
    return blended

# -----------------------------------------------------------------------------
# Recommendation Route
# -----------------------------------------------------------------------------

@app.route("/recommend", methods=["POST"])
def recommend():
    prefs = request.get_json(force=True) or {}
    listings = fetch_verified_listings()

    if not listings:
        return jsonify({"recommendations": []})

    query = preferences_to_query(prefs)

    # FIX 1: listing embeddings come from the cache — only new/edited
    # listings get encoded. Returns a plain numpy 2D array.
    listing_embeddings = get_listing_embeddings(listings)
    query_embedding = model.encode(query, convert_to_tensor=True)

    # --- Personalization: blend in the tenant's saved-listing history ---
    saved_ids = prefs.get("savedListingIds", [])
    if saved_ids:
        # FIX 1: reuse cached embeddings instead of re-encoding saved docs.
        # The cache is guaranteed to be populated for every current listing
        # because get_listing_embeddings() just ran above.
        saved_embeddings = [
            embedding_cache[l["id"]][1]
            for l in listings if l["id"] in saved_ids
        ]
        if saved_embeddings:
            final_query_vec = blend_with_history(query_embedding, saved_embeddings)
        else:
            final_query_vec = query_embedding.cpu().numpy()
    else:
        final_query_vec = query_embedding.cpu().numpy()

    # cos_sim needs 2D arrays; wrap the query vector
    similarities = util.cos_sim(final_query_vec.reshape(1, -1), listing_embeddings)[0]

    results = []
    for listing, sim in zip(listings, similarities):
        semantic_score = float(sim)
        final_score, breakdown = compute_hybrid_score(listing, prefs, semantic_score)
        results.append({
            "id": listing["id"],
            "matchScore": round(final_score * 100, 1),
            "semanticScore": breakdown["semantic"],  # FIX 2: exposed at top level for the frontend
            "breakdown": breakdown,
        })

    scores_array = np.array([r["matchScore"] / 100 for r in results])
    # FIX 1: listing_embeddings is already a numpy array — no .cpu() needed
    embeddings_array = listing_embeddings

    reranked_idx = mmr_rerank(listings, scores_array, embeddings_array, top_k=10, diversity_weight=0.3)
    final_results = [results[i] for i in reranked_idx]

    return jsonify({"recommendations": final_results})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(port=5001, debug=True)
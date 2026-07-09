# ai-service/app.py
# Content-based room recommendation using sentence embeddings.
# Run standalone: python app.py  (listens on :5001, matching your
# existing three-service architecture: React 3000 / Express 5000 / Flask 5001)

import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util
from supabase import create_client

load_dotenv()

app = Flask(__name__)
CORS(app)  # allow requests from the Vite dev server (localhost:5173/3000)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY")  # anon key is fine — RLS
                                                     # already allows public
                                                     # read of verified listings
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Loaded once at process startup. This is the expensive step (downloads
# ~80MB the first time, then loads from cache) — keep it out of the
# request path or every call would be painfully slow.
print("Loading sentence-transformer model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("Model loaded.")


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


def hard_filter_penalty(listing, prefs):
    """Business-rule adjustments layered on top of the semantic score —
    mirrors your existing calculateRecommendationScore so budget/city/
    sharing mismatches still matter even when the description text
    happens to read as a good semantic match."""
    penalty = 0.0
    budget = prefs.get("budget")
    if budget and listing["price"] > budget:
        over_pct = (listing["price"] - budget) / budget
        penalty += min(0.4, over_pct * 0.5)
    if prefs.get("preferredCity") and listing["city"].lower() != prefs["preferredCity"].lower():
        penalty += 0.15
    if prefs.get("sharing") and listing["sharing"] != prefs["sharing"]:
        penalty += 0.10
    return penalty


@app.route("/recommend", methods=["POST"])
def recommend():
    prefs = request.get_json(force=True) or {}
    listings = fetch_verified_listings()

    if not listings:
        return jsonify({"recommendations": []})

    documents = [listing_to_document(l) for l in listings]
    query = preferences_to_query(prefs)

    listing_embeddings = model.encode(documents, convert_to_tensor=True)
    query_embedding = model.encode(query, convert_to_tensor=True)

    similarities = util.cos_sim(query_embedding, listing_embeddings)[0]

    results = []
    for listing, sim in zip(listings, similarities):
        semantic_score = float(sim)  # roughly 0..1 for this kind of text
        penalty = hard_filter_penalty(listing, prefs)
        final_score = max(0.0, semantic_score - penalty)
        results.append({
            "id": listing["id"],
            "matchScore": round(final_score * 100, 1),
            "semanticScore": round(semantic_score * 100, 1),
        })

    results.sort(key=lambda r: r["matchScore"], reverse=True)
    return jsonify({"recommendations": results})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(port=5001, debug=True)
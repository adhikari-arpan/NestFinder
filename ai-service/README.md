# NestFinder — AI Service

Flask microservice that powers the "AI Recommend" flow: it turns a tenant's
preferences and NestFinder's listings into sentence embeddings, scores each
listing with a hybrid (semantic + rule-based) formula, and re-ranks the
results for diversity before handing them back to the React client.

If this service is down or unreachable, the client automatically falls back
to a pure rule-based scorer in `client/src/Context/AppContext.jsx`
(`getRecommendedListings`), so it's safe to develop the frontend without it
running — you just won't get AI-ranked results.

## How it works

1. `fetch_verified_listings()` pulls listings from the Supabase view
   `listings_with_rating` that are `status = "verified"` and still inside
   their 7-day visibility window (`LISTING_VISIBILITY_DAYS`). This window
   must stay in sync with `client/src/utils/listingLifecycle.js`.
2. Each listing is turned into a natural-language document
   (`listing_to_document`) and embedded with the `all-MiniLM-L6-v2`
   sentence-transformer model. Embeddings are cached in-memory
   (`embedding_cache`) keyed by listing id + document text, so only
   new/edited listings get re-encoded per request.
3. The tenant's structured preferences are turned into a matching
   natural-language query (`preferences_to_query`) and optionally blended
   with the embeddings of their previously saved listings
   (`blend_with_history`) for lightweight personalization.
4. `compute_hybrid_score` combines the semantic similarity with budget,
   city, sharing, room type, amenity, and proximity sub-scores into a single
   match score (0–100) plus a breakdown for the UI.
5. `mmr_rerank` re-orders the top results using Maximal Marginal Relevance
   so the final list isn't full of near-duplicate listings.

## Requirements

- Python 3.12 (this is what the checked-in `venv/` was created with; 3.9+
  should also work per the root README, but 3.12 is the tested version)
- A Supabase project with a `listings_with_rating` view/table and the same
  schema the client uses (`price`, `city`, `sharing`, `type`, `location`,
  `title`, `description`, `amenities`, `latitude`, `longitude`, `status`,
  `verified_at`)

## Setup

From the `ai-service/` folder:

```bash
# 1. Create and activate a virtual environment
python -m venv venv

# Windows (PowerShell)
venv\Scripts\Activate.ps1
# Windows (cmd)
venv\Scripts\activate.bat
# macOS / Linux
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
```

Create a `.env` file in `ai-service/` (this is git-ignored) with:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

These can be the same values used in `client/.env` (`VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY`) — same project, just without the `VITE_` prefix
since this isn't a Vite app.

```bash
# 4. Run the service
python app.py
```

The first run downloads the `all-MiniLM-L6-v2` model (~80MB) and caches it
locally, so it'll be slower to start once and fast on subsequent runs. The
service listens on **http://localhost:5001**, matching the port the client's
`src/api/aiApi.js` calls.

## API

### `POST /recommend`

Body: a JSON object shaped like `tenantPreferences` in `AppContext.jsx`
(`budget`, `preferredCity`, `sharing`, `roomType`, `essentialAmenities`,
`poiLocation`, `radius`), plus an optional `savedListingIds` array.

Response:
```json
{
  "recommendations": [
    {
      "id": 123,
      "matchScore": 87.4,
      "semanticScore": 91.2,
      "breakdown": { "semantic": 91.2, "budget": 100, "amenity": 66.7, "proximity": 80, "city": 100, "roomType": 100, "sharing": 100 }
    }
  ]
}
```

### `GET /health`

Returns `{ "status": "ok" }` — useful for a quick check that the service is
up before hitting `/recommend`.

## Notes

- `debug=True` is enabled in `app.py` for local development (auto-reload on
  file changes). Don't run this in production as-is.
- The embedding cache is in-memory and per-process — it resets whenever the
  service restarts, and won't be shared across multiple worker processes if
  you ever run this behind something like gunicorn with `--workers > 1`.

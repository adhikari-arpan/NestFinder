// Talks to the Flask AI microservice for content-based room recommendations.

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001';

/**
 * @param {object} preferences - same shape as tenantPreferences in AppContext:
 *   { budget, preferredCity, sharing, roomType, essentialAmenities, poiCollege }
 * @returns {Promise<Array<{id, matchScore, semanticScore}>>}
 */
export async function fetchAIRecommendations(preferences) {
    const res = await fetch(`${AI_SERVICE_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
    });

    if (!res.ok) {
        throw new Error(`AI recommendation service returned ${res.status}`);
    }

    const data = await res.json();
    return data.recommendations;
}
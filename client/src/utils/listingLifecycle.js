// A verified listing only stays visible to tenants for a fixed window after
// verification, then it's automatically dropped from search/browse/AI
// results (though the row itself and its 'verified' status are untouched —
// re-verifying, e.g. after an admin flag, simply restarts the window).
export const LISTING_VISIBILITY_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

// True if this listing should currently be shown to tenants: verified, and
// still within the visibility window.
export function isListingLive(listing) {
  if (listing?.status !== 'verified' || !listing.verifiedAt) return false;
  return Date.now() - new Date(listing.verifiedAt).getTime() < LISTING_VISIBILITY_DAYS * DAY_MS;
}

// Whole days left before an unverified/expired-window listing drops out of
// search. Returns null when there's no active countdown (not verified yet,
// or no verified_at recorded). Can return 0 on the final day.
export function daysRemaining(listing) {
  if (listing?.status !== 'verified' || !listing.verifiedAt) return null;
  const msLeft =
    new Date(listing.verifiedAt).getTime() + LISTING_VISIBILITY_DAYS * DAY_MS - Date.now();
  return Math.max(0, Math.ceil(msLeft / DAY_MS));
}

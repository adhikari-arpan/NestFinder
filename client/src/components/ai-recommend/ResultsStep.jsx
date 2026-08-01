import { Sparkles } from "lucide-react";
import { ResultCard } from "./ResultCard";

const poiNameShort = (name) => {
  if (name.includes("Campus")) return "Campus";
  return name.slice(0, 16) + "...";
};

const generateMatchExplanations = (room, { budget, city, amenities, location }) => {
  const reasons = [];
  if (room.price <= budget) {
    reasons.push({
      text: `Fits within your budget boundary of Rs. ${budget.toLocaleString()}`,
      positive: true,
    });
  } else {
    reasons.push({
      text: `Rs. ${(room.price - budget).toLocaleString()} over your ideal budget boundary`,
      positive: false,
    });
  }
  if (room.city.toLowerCase() === city.toLowerCase()) {
    reasons.push({
      text: `Located in your preferred city (${city})`,
      positive: true,
    });
  }
  if (room.proximityInfo) {
    const { withinRadius, distance, over } = room.proximityInfo;
    const locationLabel = location?.name || "your selected location";

    if (distance === null) {
      reasons.push({
        text: `No coordinates available to measure distance from ${locationLabel}`,
        positive: false,
      });
    } else if (withinRadius) {
      const distLabel =
        distance >= 1000
          ? `${(distance / 1000).toFixed(1)}km`
          : `${Math.round(distance)}m`;
      reasons.push({
        text: `${distLabel} from ${locationLabel} — within your search radius`,
        positive: true,
      });
    } else {
      const overLabel =
        over >= 1000 ? `${(over / 1000).toFixed(1)}km` : `${Math.round(over)}m`;
      reasons.push({
        text: `${overLabel} beyond your search radius from ${locationLabel}`,
        positive: false,
      });
    }
  }

  const presentAmenities = amenities.filter((a) => room.amenities.includes(a));
  const missingAmenities = amenities.filter((a) => !room.amenities.includes(a));
  if (presentAmenities.length > 0) {
    reasons.push({
      text: `Provides ${presentAmenities.length} of your requested amenities (${presentAmenities.join(", ")})`,
      positive: true,
    });
  }
  if (missingAmenities.length > 0) {
    reasons.push({
      text: `Missing ${missingAmenities.length} essential facility (${missingAmenities.join(", ")})`,
      positive: false,
    });
  }
  return reasons;
};

export const ResultsStep = ({
  aiResults,
  aiError,
  budget,
  roomType,
  sharing,
  city,
  amenities,
  location,
  onModify,
}) => {
  return (
    <div className="animate-fade-in flex flex-col gap-8">
      {/* Results Header */}
      <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-lg) p-6">
        <div>
          <h2 className="flex items-center gap-2 text-[1.35rem]">
            <Sparkles
              size={20}
              style={{ color: "var(--accent)", fill: "var(--accent)" }}
            />
            AI Match Score Report
          </h2>
          <p className="text-[0.85rem] text-(--text-muted)">
            Preferences: Rs. {budget.toLocaleString()} • {roomType} •{" "}
            {sharing} sharing •{" "}
            {location
              ? location.name
                ? poiNameShort(location.name)
                : "Custom location"
              : "No location"}
          </p>

          <span
            className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${
              aiError
                ? "text(--danger) bg-[rgba(239,68,68,0.1)]"
                : "bg-[rgba(16,185,129,0.1)] text-(--secondary)"
            }`}
          >
            {aiError
              ? "⚠ Rule-based (fallback)"
              : "✓ AI-powered (semantic match)"}
          </span>

          {aiError && (
            <p className="mt-1 text-[0.78rem] text-(--accent)">⚠ {aiError}</p>
          )}
        </div>
        <button onClick={onModify} className="btn btn-outline btn-sm">
          Modify Preferences
        </button>
      </div>

      {/* Results Grid */}
      <div className="mt-4 flex w-full flex-col gap-8">
        <h3 className="mb-2 text-[1.4rem] font-extrabold text-(--text-main)">
          Matched Listings ({aiResults.length})
        </h3>

        {aiResults.length === 0 ? (
          <div className="dashed rounded-lg border-2 border-(--border-color) p-10 text-center text-(--text-muted)">
            <p className="text-[1.1rem]">
              No listings verified inside the database.
            </p>
          </div>
        ) : (
          aiResults.map((item) => {
            const reasons = item.breakdown
              ? []
              : generateMatchExplanations(item, {
                  budget,
                  city,
                  amenities,
                  location,
                });
            return <ResultCard key={item.id} item={item} reasons={reasons} />;
          })
        )}
      </div>
    </div>
  );
};

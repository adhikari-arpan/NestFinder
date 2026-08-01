import { useContext } from "react";
import { Sparkles, ChevronLeft, Lock, Clock } from "lucide-react";
import { MapContainer } from "../MapContainer";
import { stepNavClass } from "./stepStyles";
import { AppContext } from "../../Context/AppContext";

// Approximate coordinates — fine-tune by clicking the exact spot on the map.
const PRESET_LOCATIONS = [
  { name: "NCIT College", lat: 27.6644, lng: 85.3188 },
  { name: "Kathford College", lat: 27.6636, lng: 85.3195 },
  { name: "Tribhuvan University", lat: 27.68, lng: 85.2895 },
  { name: "Pulchowk Campus", lat: 27.6798, lng: 85.3163 },
  { name: "St. Xavier's College Maitighar", lat: 27.6939, lng: 85.3206 },
  { name: "Apex College Baneshwor", lat: 27.6893, lng: 85.3355 },
  { name: "United Academy Kumaripati", lat: 27.6789, lng: 85.3212 },
  { name: "Kathmandu University", lat: 27.6206, lng: 85.556 },
];

const RADIUS_PRESETS = [
  { label: "🚶 Walking (500m) — Rs. 100", val: 500 },
  { label: "🏃 Near (1km) — Rs. 60", val: 1000 },
  { label: "🚲 Cycling (3km) — Rs. 30", val: 3000 },
  { label: "🌐 Extended (5km) — Rs. 15", val: 5000 },
];

export const StepLocation = ({
  location,
  setLocation,
  radius,
  setRadius,
  onBack,
  onSubmit,
}) => {
  const { getDistancePrice, paidRadiusAccess } = useContext(AppContext);
  const currentPrice = getDistancePrice(radius);

  const hasPaidAccess =
    paidRadiusAccess &&
    paidRadiusAccess.paidUntil > Date.now() &&
    radius <= paidRadiusAccess.activeRadius;

  return (
    <div className="card animate-fade-in flex flex-col gap-10 rounded-lg border border-(--border-color) bg-(--bg-card) p-8 shadow-lg sm:p-12">
      <div>
        <h2 className="mb-2 text-[1.4rem]">Step 4: Location & Distance Tier</h2>
        <p className="text-[0.9rem] text-(--text-muted)">
          Select your central point of interest and desired search radius tier.
          Each distance tier carries a personalized recommendation fee valid for 48 hours.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="form-group">
          <label className="form-label">Preset Locations</label>
          <select
            value={
              location?.name &&
              PRESET_LOCATIONS.some((p) => p.name === location.name)
                ? location.name
                : ""
            }
            onChange={(e) => {
              const preset = PRESET_LOCATIONS.find(
                (p) => p.name === e.target.value,
              );
              setLocation(preset || null);
            }}
            className="form-input w-full cursor-pointer p-4 text-[1rem]"
            style={{
              backgroundColor: "color-mix(in srgb, var(--bg-app) 85%, transparent)",
            }}
          >
            <option value="">Select a preset location...</option>
            {PRESET_LOCATIONS.map((preset) => (
              <option key={preset.name} value={preset.name}>
                🎓 {preset.name}
              </option>
            ))}
          </select>
          {location && (
            <button
              type="button"
              onClick={() => setLocation(null)}
              className="mt-3 cursor-pointer border-none bg-transparent text-[0.8rem] font-semibold text-(--text-muted) hover:text-(--danger)"
            >
              Clear selected location
            </button>
          )}
        </div>

        <div className="form-group">
          <label className="form-label mb-2 block">
            Or pick a point on the map
          </label>
          <div className="h-87.5 overflow-hidden rounded-md border border-(--border-color)">
            <MapContainer
              selectable
              onLocationSelect={(lat, lng) =>
                setLocation({ name: null, lat, lng })
              }
              selectedLocation={
                location ? { lat: location.lat, lng: location.lng } : null
              }
              selectionRadius={radius}
              currentCenter={location ? [location.lat, location.lng] : null}
            />
          </div>
          <span className="mt-2 block text-[0.8rem] text-(--text-light)">
            {location
              ? `Selected: ${location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}`
              : "Click anywhere on the map to drop a pin."}
          </span>
        </div>

        {/* Radius & Paid Tier Input */}
        <div className="form-group">
          <div className="mb-2 flex items-center justify-between">
            <label className="form-label">Search Radius Tier</label>
            <div className="flex items-center gap-2">
              <strong className="text-[1.1rem] text-(--primary)">
                {radius >= 1000
                  ? `${(radius / 1000).toFixed(1)} km`
                  : `${radius} m`}
              </strong>
              <span className="rounded-full bg-(--primary) px-2.5 py-0.5 text-[0.8rem] font-extrabold text-white">
                Rs. {currentPrice}
              </span>
            </div>
          </div>
          <input
            type="range"
            min="200"
            max="5000"
            step="100"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full cursor-pointer accent-(--primary)"
          />
          <div className="mt-1 flex justify-between">
            <span className="text-[0.75rem] text-(--text-light)">
              200m (Walking — Highest Precision)
            </span>
            <span className="text-[0.75rem] text-(--text-light)">
              5km (Extended Proximity)
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            {RADIUS_PRESETS.map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setRadius(opt.val)}
                className="cursor-pointer rounded-full border px-3 py-1.5 text-[0.78rem] font-semibold transition-all"
                style={
                  radius === opt.val
                    ? {
                        background: "var(--primary)",
                        color: "white",
                        border: "1px solid var(--primary)",
                      }
                    : {
                        background: "transparent",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border-color)",
                      }
                }
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Access Status Banner */}
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.85rem",
              backgroundColor: hasPaidAccess
                ? "rgba(16, 185, 129, 0.1)"
                : "color-mix(in srgb, var(--primary) 10%, transparent)",
              border: hasPaidAccess
                ? "1px solid rgba(16, 185, 129, 0.3)"
                : "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {hasPaidAccess ? (
                <>
                  <Clock size={16} style={{ color: "#10b981" }} />
                  <span style={{ color: "#10b981", fontWeight: 600 }}>
                    Active 48-Hour Paid Access Unlocked ({paidRadiusAccess.activeRadius >= 1000 ? (paidRadiusAccess.activeRadius/1000) + 'km' : paidRadiusAccess.activeRadius + 'm'})
                  </span>
                </>
              ) : (
                <>
                  <Lock size={16} style={{ color: "var(--primary)" }} />
                  <span>
                    Distance Tier Fee: <strong>Rs. {currentPrice}</strong> (Unlocks for <strong>48 Hours</strong>)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={stepNavClass}>
        <button onClick={onBack} className="btn btn-outline flex gap-1">
          <ChevronLeft size={18} /> Back
        </button>
        <button onClick={onSubmit} className="btn btn-secondary flex gap-1">
          <Sparkles size={18} style={{ fill: "white" }} /> Calculate
          Recommendations
        </button>
      </div>
    </div>
  );
};

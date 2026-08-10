import { useContext } from "react";
import { Lock, Clock, TrendingUp } from "lucide-react";
import { MapContainer } from "./MapContainer";
import { AppContext } from "../Context/AppContext";
import { RADIUS_OPTIONS } from "../utils/paymentUtils";
import { PRESET_LOCATIONS } from "../utils/presetLocations";

function radiusLabel(radius) {
  return radius >= 1000 ? `${(radius / 1000).toFixed(1)}km` : `${radius}m`;
}

// Shared "pick a target location + distance radius tier" control, used by
// both the AI Recommend wizard (Step 4) and the /rooms distance-unlock
// picker — previously two separately-maintained, drifting copies of the
// same UI. Owns: the preset-location dropdown <-> map sync (dropping a
// custom pin clears the dropdown back to blank), the clear-selection
// button, the radius slider + preset tier buttons (sourced from
// paymentUtils.RADIUS_OPTIONS so prices can't drift out of sync with what's
// actually charged), and the fee / paid-access status banner.
//
// location: { name, lat, lng } | null — name is null for a custom map pin.
export const LocationRadiusPicker = ({
  location,
  onLocationChange,
  radius,
  onRadiusChange,
}) => {
  const { checkDistanceAccess, isRadiusUpgrade, getRadiusPaymentAmount, paidRadiusAccess } =
    useContext(AppContext);
  const currentPrice = getRadiusPaymentAmount(location, radius);
  const hasPaidAccess = checkDistanceAccess(location, radius);
  const isUpgrade = isRadiusUpgrade(location, radius);

  return (
    <div className="flex flex-col gap-6">
      <div className="form-group">
        <label className="form-label">Target Location (College / Workplace)</label>
        <select
          value={
            location?.name && PRESET_LOCATIONS.some((p) => p.name === location.name)
              ? location.name
              : ""
          }
          onChange={(e) => {
            const preset = PRESET_LOCATIONS.find((p) => p.name === e.target.value);
            onLocationChange(preset || null);
          }}
          className="form-input w-full cursor-pointer p-4 text-[1rem]"
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
            onClick={() => onLocationChange(null)}
            className="mt-3 cursor-pointer border-none bg-transparent text-[0.8rem] font-semibold text-(--text-muted) hover:text-(--danger)"
          >
            Clear selected location
          </button>
        )}
      </div>

      <div className="form-group">
        <label className="form-label mb-2 block">Or pick a point on the map</label>
        <div className="h-87.5 overflow-hidden rounded-md border border-(--border-color)">
          <MapContainer
            selectable
            onLocationSelect={(lat, lng) => onLocationChange({ name: null, lat, lng })}
            selectedLocation={location ? { lat: location.lat, lng: location.lng } : null}
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

      <div className="form-group">
        <div className="mb-2 flex items-center justify-between">
          <label className="form-label">Search Radius Tier</label>
          <div className="flex items-center gap-2">
            <strong className="text-[1.1rem] text-(--primary)">
              {radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius} m`}
            </strong>
            <span className="rounded-full bg-(--primary) px-2.5 py-0.5 text-[0.8rem] font-extrabold text-white">
              {isUpgrade ? `+Rs. ${currentPrice}` : `Rs. ${currentPrice}`}
            </span>
          </div>
        </div>
        <input
          type="range"
          min="200"
          max="5000"
          step="100"
          value={radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
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

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.val}
              type="button"
              onClick={() => onRadiusChange(opt.val)}
              className="cursor-pointer rounded-lg border px-3 py-2 text-[0.78rem] font-semibold transition-all"
              style={
                radius === opt.val
                  ? { background: "var(--primary)", color: "white", border: "1px solid var(--primary)" }
                  : { background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-color)" }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Fee / Paid Access Status Banner */}
        <div
          className="mt-4 flex items-center gap-2 rounded-[10px] px-4 py-3 text-[0.85rem]"
          style={{
            backgroundColor: hasPaidAccess
              ? "rgba(16, 185, 129, 0.1)"
              : isUpgrade
                ? "rgba(245, 158, 11, 0.1)"
                : "color-mix(in srgb, var(--primary) 10%, transparent)",
            border: hasPaidAccess
              ? "1px solid rgba(16, 185, 129, 0.3)"
              : isUpgrade
                ? "1px solid rgba(245, 158, 11, 0.3)"
                : "1px solid color-mix(in srgb, var(--primary) 30%, transparent)",
          }}
        >
          {hasPaidAccess ? (
            <>
              <Clock size={16} style={{ color: "#10b981" }} />
              <span style={{ color: "#10b981", fontWeight: 600 }}>
                Active 48-Hour Paid Access Unlocked ({radius >= 1000 ? `${radius / 1000}km` : `${radius}m`})
              </span>
            </>
          ) : isUpgrade ? (
            <>
              <TrendingUp size={16} style={{ color: "#f59e0b" }} />
              <span>
                Upgrade Fee: <strong>Rs. {currentPrice}</strong> — you already
                have access up to{" "}
                <strong>{radiusLabel(paidRadiusAccess.activeRadius)}</strong>,
                so you only pay the difference to extend to{" "}
                <strong>{radiusLabel(radius)}</strong> (refreshes your{" "}
                <strong>48-hour</strong> access window)
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
  );
};

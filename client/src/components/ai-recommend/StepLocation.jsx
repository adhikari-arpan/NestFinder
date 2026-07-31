import { Sparkles, ChevronLeft } from "lucide-react";
import { MapContainer } from "../MapContainer";
import { stepNavClass } from "./stepStyles";

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
  { label: "🚶 Walking (500m)", val: 500 },
  { label: "🏃 Near (1km)", val: 1000 },
  { label: "🚲 Cycling (3km)", val: 3000 },
];

export const StepLocation = ({
  location,
  setLocation,
  radius,
  setRadius,
  onBack,
  onSubmit,
}) => {
  return (
    <div className="card animate-fade-in flex flex-col gap-10 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--bg-card)] p-8 shadow-lg sm:p-12">
      <div>
        <h2 className="mb-2 text-[1.4rem]">Step 4: Location</h2>
        <p className="text-[0.9rem] text-[var(--text-muted)]">
          Add a location that you want to search rooms around. Choose from
          the following presets, or select your central location from the
          map.
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
              className="mt-3 cursor-pointer border-none bg-transparent text-[0.8rem] font-semibold text-[var(--text-muted)] hover:text-[var(--danger)]"
            >
              Clear selected location
            </button>
          )}
        </div>

        <div className="form-group">
          <label className="form-label mb-2 block">
            Or pick a point on the map
          </label>
          <div className="h-[350px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-color)]">
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
          <span className="mt-2 block text-[0.8rem] text-[var(--text-light)]">
            {location
              ? `Selected: ${location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}`
              : "Click anywhere on the map to drop a pin."}
          </span>
        </div>

        {/* Radius Input */}
        <div className="form-group">
          <div className="mb-2 flex items-center justify-between">
            <label className="form-label">Search Radius</label>
            <strong className="text-[1.1rem] text-(--primary)">
              {radius >= 1000
                ? `${(radius / 1000).toFixed(1)} km`
                : `${radius} m`}
            </strong>
          </div>
          <input
            type="range"
            min="200"
            max="5000"
            step="100"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full cursor-pointer accent-[var(--primary)]"
          />
          <div className="mt-1 flex justify-between">
            <span className="text-[0.75rem] text-[var(--text-light)]">
              200m (walking)
            </span>
            <span className="text-[0.75rem] text-[var(--text-light)]">
              5km (cycling)
            </span>
          </div>
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

import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import { MapContainer } from "../components/MapContainer";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Brain,
  Cpu,
} from "lucide-react";

export const AIRecommend = () => {
  const navigate = useNavigate();
  const {
    tenantPreferences,
    setTenantPreferences,
    getRecommendedListings,
    getAIRecommendedListings,
    aiError,
  } = useContext(AppContext);

  const [step, setStep] = useState(1);

  const [budget, setBudget] = useState(tenantPreferences.budget);
  const [city, setCity] = useState(tenantPreferences.preferredCity);
  const [sharing, setSharing] = useState(tenantPreferences.sharing);
  const [roomType, setRoomType] = useState(tenantPreferences.roomType);
  const [amenities, setAmenities] = useState(
    tenantPreferences.essentialAmenities,
  );
  const [location, setLocation] = useState(tenantPreferences.poiLocation);
  const [aiLoadingText, setAiLoadingText] = useState(
    "Vectorizing preferences...",
  );
  const [radius, setRadius] = useState(tenantPreferences.radius || 1000); // meters

  const [activePreferences, setActivePreferences] = useState(null);
  const [aiResults, setAiResults] = useState([]);

  // Approximate coordinates — fine-tune by clicking the exact spot on the map.
  const presetLocations = [
    { name: "NCIT College", lat: 27.6644, lng: 85.3188 },
    { name: "Kathford College", lat: 27.6636, lng: 85.3195 },
    { name: "Tribhuvan University", lat: 27.68, lng: 85.2895 },
    { name: "Pulchowk Campus", lat: 27.6798, lng: 85.3163 },
    { name: "St. Xavier's College Maitighar", lat: 27.6939, lng: 85.3206 },
    { name: "Apex College Baneshwor", lat: 27.6893, lng: 85.3355 },
    { name: "United Academy Kumaripati", lat: 27.6789, lng: 85.3212 },
    { name: "Kathmandu University", lat: 27.6206, lng: 85.556 },
  ];

  const allFacilities = [
    "WiFi",
    "Hot Water",
    "Parking",
    "Furnished",
    "Kitchen",
    "Balcony",
    "Backup Electricity",
  ];

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const toggleAmenity = (item) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item],
    );
  };

  const handleRunAssessment = () => {
    const prefs = {
      budget,
      preferredCity: city,
      sharing,
      roomType,
      essentialAmenities: amenities,
      poiLocation: location,
      radius,
    };
    setTenantPreferences(prefs);
    setActivePreferences(prefs);
    nextStep();
  };

  useEffect(() => {
    if (step === 5) {
      const timer1 = setTimeout(
        () =>
          setAiLoadingText(
            "Generating embedding vector representing your preferences...",
          ),
        800,
      );
      const timer2 = setTimeout(
        () =>
          setAiLoadingText(
            "Calculating cosine similarity distances using all-MiniLM-L6-v2 model...",
          ),
        1600,
      );
      const timer3 = setTimeout(
        () =>
          setAiLoadingText(
            "Sorting match listings by density weight matrices...",
          ),
        2400,
      );

      const startedAt = Date.now();
      getAIRecommendedListings(activePreferences).then((results) => {
        // Keep the loading screen up for at least ~3.2s total so the
        // status text isn't cut off mid-sentence if the API responds fast.
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, 3200 - elapsed);
        setTimeout(() => {
          setAiResults(results);
          setStep(6);
        }, remaining);
      });

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setAiLoadingText("Vectorizing preferences...");
    }
  }, [step]);

  const generateMatchExplanations = (room) => {
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

    const presentAmenities = amenities.filter((a) =>
      room.amenities.includes(a),
    );
    const missingAmenities = amenities.filter(
      (a) => !room.amenities.includes(a),
    );
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

  const poiNameShort = (name) => {
    if (name.includes("Campus")) return "Campus";
    return name.slice(0, 16) + "...";
  };

  // Reusable step nav button styles
  const stepNavClass =
    "flex justify-between border-t border-[var(--border-color)] pt-8 mt-4";
  const selBtnClass = (active) =>
    `btn flex-1 transition-all duration-200 border-2 ${
      active
        ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-md transform scale-[1.02]"
        : "border-[var(--border-color)] bg-transparent hover:border-[var(--primary-light)]"
    }`;

  return (
    <div
      className="container min-h-[140vh] max-w-[1200px] bg-gradient-to-b from-[rgba(99,102,241,0.03)] to-transparent px-4 pb-32 text-left sm:px-10"
      style={{ paddingTop: "40px" }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 style={{ marginBottom: '60px' }}>">
        <div className="flex size-16 -rotate-6 transform items-center justify-center rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--primary)] to-[#7c3aed] text-white shadow-lg">
          <Brain size={42} />
        </div>
        <div>
          <h1 className="m-0 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-[2rem] leading-tight font-extrabold text-transparent sm:text-[2.5rem]">
            AI Room Finder Assistant
          </h1>
          <p
            className="mt-2 text-[1rem] font-medium text-[var(--text-muted)]"
            style={{ marginBottom: "20px" }}
          >
            Smart preference matching powered by Next-Gen AI.
          </p>
        </div>
      </div>

      {/* Progress Tracker */}
      {step <= 4 && (
        <div
          className="flex items-center justify-between gap-5 rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--bg-card)] px-8 py-6"
          style={{ marginBottom: "50px" }}
        >
          {[
            { num: 1, label: "Budget & Location" },
            { num: 2, label: "Room Spec" },
            { num: 3, label: "Facilities" },
            { num: 4, label: "Location" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-2 transition-opacity ${step >= s.num ? "opacity-100" : "opacity-40"}`}
            >
              <span
                className={`flex size-7 items-center justify-center rounded-full text-[0.85rem] font-bold text-white ${
                  step === s.num
                    ? "bg-[var(--primary)]"
                    : step > s.num
                      ? "bg-[var(--secondary)]"
                      : "bg-[var(--border-color)]"
                }`}
              >
                {step > s.num ? <Check size={14} /> : s.num}
              </span>
              <span className="hidden text-[0.85rem] font-semibold sm:inline">
                {s.label}
              </span>
              {s.num < 4 && (
                <div className="hidden h-[2px] w-[30px] bg-[var(--border-color)] sm:block" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="card animate-fade-in flex flex-col gap-10 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--bg-card)] p-8 shadow-lg sm:p-12">
          <div>
            <h2 className="mb-2 text-[1.4rem]">
              Step 1: Budget Boundaries & City
            </h2>
            <p className="text-[0.9rem] text-[var(--text-muted)]">
              Set your maximum budget constraints and search zone in Kathmandu
              Valley.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="form-group">
              <label className="form-label">Preferred City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="form-input w-full cursor-pointer p-4 text-[1rem]"
              >
                {["Kathmandu", "Lalitpur", "Bhaktapur"].map((c) => (
                  <option key={c} value={c}>
                    📍 {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div className="flex items-center justify-between">
                <label className="form-label">Maximum Monthly Budget</label>
                <strong className="text-[1.1rem] text-[var(--primary)]">
                  Rs. {budget.toLocaleString("en-IN")}
                </strong>
              </div>
              <input
                type="range"
                min="3000"
                max="40000"
                step="500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full cursor-pointer accent-[var(--primary)]"
              />
              <span className="text-[0.75rem] text-[var(--text-light)]">
                Min: Rs. 3,000 • Max: Rs. 40,000
              </span>
            </div>
          </div>

          <div className="flex justify-end border-t border-[var(--border-color)] pt-5">
            <button onClick={nextStep} className="btn btn-primary flex gap-1">
              Next Step <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="card animate-fade-in flex flex-col gap-10 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--bg-card)] p-8 shadow-lg sm:p-12">
          <div>
            <h2 className="mb-2 text-[1.4rem]">Step 2: Room Layout</h2>
            <p className="text-[0.9rem] text-[var(--text-muted)]">
              Select whether you require a single private bedroom or a full
              independent flat.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="form-group">
              <label className="form-label">Housing Type</label>
              <div className="flex gap-4">
                {[
                  { val: "Room", label: "Single Room Only" },
                  { val: "Flat", label: "Entire Flat/Apartment" },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setRoomType(item.val)}
                    type="button"
                    className={`${selBtnClass(roomType === item.val)} flex flex-col gap-1 p-5`}
                  >
                    <strong>{item.label}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bed sharing preference</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { val: "Single", label: "Single (Solo Room)" },
                  { val: "Shared", label: "Shared (Roommate)" },
                  { val: "Private", label: "Private Layout (No sharing)" },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setSharing(item.val)}
                    type="button"
                    className={`${selBtnClass(sharing === item.val)} min-w-[150px] flex-1`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={stepNavClass}>
            <button onClick={prevStep} className="btn btn-outline flex gap-1">
              <ChevronLeft size={18} /> Back
            </button>
            <button onClick={nextStep} className="btn btn-primary flex gap-1">
              Next Step <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="card animate-fade-in flex flex-col gap-10 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--bg-card)] p-8 shadow-lg sm:p-12">
          <div>
            <h2 className="mb-2 text-[1.4rem]">Step 3: Essential Facilities</h2>
            <p className="text-[0.9rem] text-[var(--text-muted)]">
              Check any facilities that are non-negotiable for you. Our model
              penalizes listings missing these items.
            </p>
          </div>

          <div className="form-group text-left">
            <label className="form-label mb-4 block">Required Amenities</label>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
              {allFacilities.map((fac, idx) => {
                const isSelected = amenities.includes(fac);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleAmenity(fac)}
                    className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 transition-all ${
                      isSelected
                        ? "border-[var(--secondary)] bg-[var(--secondary-light)]"
                        : "border-[var(--border-color)] bg-transparent"
                    }`}
                  >
                    <div
                      className={`flex size-5 items-center justify-center rounded-[4px] border-2 text-white transition-colors ${
                        isSelected
                          ? "border-[var(--secondary)] bg-[var(--secondary)]"
                          : "border-[var(--border-color)] bg-transparent"
                      }`}
                    >
                      {isSelected && <Check size={14} />}
                    </div>
                    <span className="text-[0.92rem] font-medium">{fac}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={stepNavClass}>
            <button onClick={prevStep} className="btn btn-outline flex gap-1">
              <ChevronLeft size={18} /> Back
            </button>
            <button onClick={nextStep} className="btn btn-primary flex gap-1">
              Next Step <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="card animate-fade-in flex flex-col gap-10 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--bg-card)] p-8 shadow-lg sm:p-12">
          <div>
            <h2 className="mb-2 text-[1.4rem]">Step 4: Location</h2>
            <p className="text-[0.9rem] text-[var(--text-muted)]">
              Add a location that you want to search rooms around. Choose
              from the following presets, or select your central location
              from the map.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="form-group">
              <label className="form-label">Preset Locations</label>
              <select
                value={
                  location?.name &&
                  presetLocations.some((p) => p.name === location.name)
                    ? location.name
                    : ""
                }
                onChange={(e) => {
                  const preset = presetLocations.find(
                    (p) => p.name === e.target.value,
                  );
                  setLocation(preset || null);
                }}
                className="form-input w-full cursor-pointer p-4 text-[1rem]"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--bg-app) 55%, transparent)",
                }}
              >
                <option value="">Select a preset location...</option>
                {presetLocations.map((preset) => (
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
                {[
                  { label: "🚶 Walking (500m)", val: 500 },
                  { label: "🏃 Near (1km)", val: 1000 },
                  { label: "🚲 Cycling (3km)", val: 3000 },
                ].map((opt) => (
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
            <button onClick={prevStep} className="btn btn-outline flex gap-1">
              <ChevronLeft size={18} /> Back
            </button>
            <button
              onClick={handleRunAssessment}
              className="btn btn-secondary flex gap-1"
            >
              <Sparkles size={18} style={{ fill: "white" }} /> Calculate
              Recommendations
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Loading */}
      {step === 5 && (
        <div className="card animate-fade-in flex flex-col items-center gap-10 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--bg-card)] px-10 py-20 text-center shadow-lg">
          <div className="relative size-20">
            <div className="size-full animate-spin rounded-full border-4 border-[var(--primary-light)] border-t-[var(--primary)]" />
            <Cpu
              size={30}
              className="absolute top-[25px] left-[25px] text-[var(--primary)]"
            />
          </div>
          <div>
            <h3 className="mb-2">Evaluating NestFinder AI Model</h3>
            <p className="text-[0.85rem] text-[var(--text-light)]">
              Embedding Transformer: <code>all-MiniLM-L6-v2</code>
            </p>
          </div>
          <div className="w-full max-w-[500px] rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--bg-app)] p-4 font-mono text-[0.82rem] text-[var(--primary)]">
            {aiLoadingText}
          </div>
        </div>
      )}

      {/* STEP 6: Results */}
      {step === 6 && (
        <div className="animate-fade-in flex flex-col gap-8">
          {/* Results Header */}
          {/* Results Header */}
          <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-lg)] p-6">
            <div>
              <h2 className="flex items-center gap-2 text-[1.35rem]">
                <Sparkles
                  size={20}
                  style={{ color: "var(--accent)", fill: "var(--accent)" }}
                />
                AI Match Score Report
              </h2>
              <p className="text-[0.85rem] text-[var(--text-muted)]">
                Preferences: Rs. {budget.toLocaleString()} • {roomType} •{" "}
                {sharing} sharing •{" "}
                {location
                  ? location.name
                    ? poiNameShort(location.name)
                    : "Custom location"
                  : "No location"}
              </p>

              {/* ADD THE BADGE HERE */}
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
                <p className="mt-1 text-[0.78rem] text-(--accent)">
                  ⚠ {aiError}
                </p>
              )}
            </div>
            <button
              onClick={() => setStep(1)}
              className="btn btn-outline btn-sm"
            >
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
                const reasons = item.breakdown ? [] : generateMatchExplanations(item);
                return (
                  <div
                    key={item.id}
                    className="card overflow-hidden rounded-[var(--radius-lg)] bg-[var(--bg-card)] p-0 shadow-lg transition-all duration-300 hover:border-(--primary) hover:shadow-xl"
                  >
                    <div className="grid h-full grid-cols-1 md:grid-cols-[350px_1fr]">
                      {/* Image side */}
                      <div className="relative h-62.5 overflow-hidden md:h-full">
                        <img
                          src={item.images[0]}
                          className="size-full object-cover transition-transform duration-500 hover:scale-105"
                          alt={item.title}
                        />
                        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full border-2 border-white/20 bg-linear-to-r from-[var(--primary)] to-[#7c3aed] px-4 py-2 text-[1rem] font-extrabold text-white shadow-lg">
                          <Sparkles size={16} />
                          {item.matchScore}% Match
                        </div>
                      </div>

                      {/* Details side */}
                      <div className="flex flex-col justify-between p-8">
                        <div className="text-left">
                          <div className="mb-2 flex items-start justify-between">
                            <span className="rounded-full bg-[var(--primary-light)] px-3 py-1 text-[0.8rem] font-bold tracking-wider text-[var(--primary)] uppercase">
                              {item.sharing} • {item.type}
                            </span>
                            <strong className="text-[1.4rem] font-extrabold text-[var(--text-main)]">
                              Rs. {item.price.toLocaleString("en-IN")}/mo
                            </strong>
                          </div>

                          <h4 className="my-2 text-[1.5rem] leading-tight font-extrabold">
                            <Link
                              to={`/room/${item.id}`}
                              className="text-[var(--text-main)] transition-colors hover:text-[var(--primary)]"
                            >
                              {item.title}
                            </Link>
                          </h4>
                          <p className="mb-4 flex items-center gap-1 text-[0.95rem] text-[var(--text-muted)]">
                            📍 {item.location}
                          </p>

                          {/* Match Reasons - Rule Based Fallback Only */}
                          {!item.breakdown && (
                            <div className="mt-4 flex flex-col gap-3 rounded-[var(--radius-md)] border border-[rgba(16,185,129,0.15)] bg-[rgba(16,185,129,0.05)] p-4">
                              <strong className="text-[0.85rem] tracking-wider text-[var(--text-muted)] uppercase">
                                Why it matches:
                              </strong>
                              {reasons.map((r, i) => (
                                <div
                                  key={i}
                                  className={`flex items-start gap-3 ${r.positive ? "text-[var(--secondary)]" : "text-[var(--danger)]"}`}
                                >
                                  <span
                                    className={`mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-full text-white ${r.positive ? "bg-[var(--secondary)]" : "bg-[var(--danger)]"}`}
                                  >
                                    {r.positive ? <Check size={14} /> : "✕"}
                                  </span>
                                  <span className="text-[1.05rem] leading-snug font-medium">
                                    {r.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* AI factor breakdown — only present when results came from Flask */}
                        {item.breakdown && (
                          <div className="mt-4 rounded-[var(--radius-md)] border border-[rgba(99,102,241,0.15)] bg-[rgba(99,102,241,0.05)] p-4">
                            <strong className="text-[0.85rem] tracking-wider text-[var(--text-muted)] uppercase">
                              AI Score Breakdown:
                            </strong>
                            <div className="mt-3 flex flex-col gap-2">
                              {[
                                {
                                  label: "Semantic Fit",
                                  value: item.breakdown.semantic,
                                },
                                {
                                  label: "Budget",
                                  value: item.breakdown.budget,
                                },
                                {
                                  label: "Amenities",
                                  value: item.breakdown.amenity,
                                },
                                {
                                  label: "Proximity",
                                  value: item.breakdown.proximity,
                                },
                                { label: "City", value: item.breakdown.city },
                                {
                                  label: "Room Type",
                                  value: item.breakdown.roomType,
                                },
                                {
                                  label: "Sharing",
                                  value: item.breakdown.sharing,
                                },
                              ].map((f) => (
                                <div
                                  key={f.label}
                                  className="flex items-center gap-3"
                                >
                                  <span className="w-24 flex-shrink-0 text-[0.8rem] font-medium">
                                    {f.label}
                                  </span>
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--border-color)]">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-500"
                                      style={{ width: `${f.value}%` }}
                                    />
                                  </div>
                                  <span className="w-12 text-right text-[0.8rem] font-bold">
                                    {f.value}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex justify-end pt-6">
                          <Link
                            to={`/room/${item.id}`}
                            className="btn btn-primary rounded-full px-8 py-3 text-[1.05rem] font-bold shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
                          >
                            View Room Details →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

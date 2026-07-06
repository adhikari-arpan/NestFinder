import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Brain,
  Cpu,
} from 'lucide-react';

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
  const [amenities, setAmenities] = useState(tenantPreferences.essentialAmenities);
  const [college, setCollege] = useState(tenantPreferences.poiCollege);
  const [aiLoadingText, setAiLoadingText] = useState('Vectorizing preferences...');

  const [activePreferences, setActivePreferences] = useState(null);
  const [aiResults, setAiResults] = useState([]);

  const collegesList = [
    "Tribhuvan University",
    "Pulchowk Campus",
    "St. Xavier's College Maitighar",
    "Apex College Baneshwor",
    "United Academy Kumaripati",
    "Kathmandu University"
  ];

  const allFacilities = [
    "WiFi", "Hot Water", "Parking", "Furnished", "Kitchen", "Balcony", "Backup Electricity"
  ];

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const toggleAmenity = (item) => {
    setAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handleRunAssessment = () => {
    const prefs = {
      budget,
      preferredCity: city,
      sharing,
      roomType,
      essentialAmenities: amenities,
      poiCollege: college
    };
    setTenantPreferences(prefs);
    setActivePreferences(prefs);
    nextStep();
  };

  useEffect(() => {
    if (step === 5) {
      const timer1 = setTimeout(() => setAiLoadingText("Generating embedding vector representing your preferences..."), 800);
      const timer2 = setTimeout(() => setAiLoadingText("Calculating cosine similarity distances using all-MiniLM-L6-v2 model..."), 1600);
      const timer3 = setTimeout(() => setAiLoadingText("Sorting match listings by density weight matrices..."), 2400);

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

      return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
    } else {
      setAiLoadingText("Vectorizing preferences...");
    }
  }, [step]);

  const generateMatchExplanations = (room) => {
    const reasons = [];
    if (room.price <= budget) {
      reasons.push({ text: `Fits within your budget boundary of Rs. ${budget.toLocaleString()}`, positive: true });
    } else {
      reasons.push({ text: `Rs. ${(room.price - budget).toLocaleString()} over your ideal budget boundary`, positive: false });
    }
    if (room.city.toLowerCase() === city.toLowerCase()) {
      reasons.push({ text: `Located in your preferred city (${city})`, positive: true });
    }
    const matchPOI = room.nearbyPOIs.find(poi =>
      poi.type === "College" &&
      (poi.name.toLowerCase().includes(college.toLowerCase()) ||
        college.toLowerCase().includes(poi.name.toLowerCase()))
    );
    if (matchPOI) {
      reasons.push({ text: `Extremely close to ${poiNameShort(college)} (${matchPOI.distance}m distance)`, positive: true });
    }
    const presentAmenities = amenities.filter(a => room.amenities.includes(a));
    const missingAmenities = amenities.filter(a => !room.amenities.includes(a));
    if (presentAmenities.length > 0) {
      reasons.push({ text: `Provides ${presentAmenities.length} of your requested amenities (${presentAmenities.join(', ')})`, positive: true });
    }
    if (missingAmenities.length > 0) {
      reasons.push({ text: `Missing ${missingAmenities.length} essential facility (${missingAmenities.join(', ')})`, positive: false });
    }
    return reasons;
  };

  const poiNameShort = (name) => {
    if (name.includes("Campus")) return "Campus";
    return name.slice(0, 16) + "...";
  };

  // Reusable step nav button styles
  const stepNavClass = "flex justify-between border-t border-[var(--border-color)] pt-8 mt-4";
  const selBtnClass = (active) =>
    `btn flex-1 transition-all duration-200 border-2 ${active
      ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-md transform scale-[1.02]'
      : 'border-[var(--border-color)] bg-transparent hover:border-[var(--primary-light)]'}`;

  return (
       <div className="container px-4 sm:px-10 pb-32 text-left max-w-[1200px] min-h-[140vh] bg-gradient-to-b from-[rgba(99,102,241,0.03)] to-transparent" style={{ paddingTop: '40px' }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 style={{ marginBottom: '60px' }}>">
         <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--primary)] to-[#7c3aed] flex items-center justify-center text-white shadow-lg transform -rotate-6">
          <Brain size={42} />
        </div>
        <div>
          <h1 className="text-[2rem] sm:text-[2.5rem] font-extrabold m-0 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
            AI Room Finder Assistant
          </h1>
          <p className="text-[var(--text-muted)] text-[1rem] mt-2 font-medium" style={{ marginBottom: '20px' }}>
            Smart preference matching powered by Next-Gen AI.
          </p>
        </div>
      </div>

      {/* Progress Tracker */}
      {step <= 4 && (
        <div className="flex justify-between items-center gap-5 bg-[var(--bg-card)] px-8 py-6 rounded-[var(--radius-md)] border border-[var(--border-color)]" style={{ marginBottom: '50px' }}>
          {[
            { num: 1, label: "Budget & Location" },
            { num: 2, label: "Room Spec" },
            { num: 3, label: "Facilities" },
            { num: 4, label: "College Proximity" }
          ].map((s) => (
            <div key={s.num} className={`flex items-center gap-2 transition-opacity ${step >= s.num ? 'opacity-100' : 'opacity-40'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[0.85rem] text-white ${step === s.num ? 'bg-[var(--primary)]' : step > s.num ? 'bg-[var(--secondary)]' : 'bg-[var(--border-color)]'
                }`}>
                {step > s.num ? <Check size={14} /> : s.num}
              </span>
              <span className="text-[0.85rem] font-semibold hidden sm:inline">{s.label}</span>
              {s.num < 4 && <div className="w-[30px] h-[2px] bg-[var(--border-color)] hidden sm:block" />}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="card shadow-lg border border-[var(--border-color)] bg-[var(--bg-card)] animate-fade-in flex flex-col gap-10 p-8 sm:p-12 rounded-[var(--radius-lg)]">
          <div>
            <h2 className="text-[1.4rem] mb-2">Step 1: Budget Boundaries & City</h2>
            <p className="text-[var(--text-muted)] text-[0.9rem]">Set your maximum budget constraints and search zone in Kathmandu Valley.</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="form-group">
            <label className="form-label">Preferred City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="form-input w-full p-4 text-[1rem] cursor-pointer"
            >
              {["Kathmandu", "Lalitpur", "Bhaktapur"].map((c) => (
                <option key={c} value={c}>📍 {c}</option>
              ))}
            </select>
          </div>

            <div className="form-group">
              <div className="flex justify-between items-center">
                <label className="form-label">Maximum Monthly Budget</label>
                <strong className="text-[1.1rem] text-[var(--primary)]">Rs. {budget.toLocaleString('en-IN')}</strong>
              </div>
              <input
                type="range" min="3000" max="40000" step="500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full cursor-pointer accent-[var(--primary)]"
              />
              <span className="text-[0.75rem] text-[var(--text-light)]">Min: Rs. 3,000 • Max: Rs. 40,000</span>
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
        <div className="card shadow-lg border border-[var(--border-color)] bg-[var(--bg-card)] animate-fade-in flex flex-col gap-10 p-8 sm:p-12 rounded-[var(--radius-lg)]">
          <div>
            <h2 className="text-[1.4rem] mb-2">Step 2: Room Layout</h2>
            <p className="text-[var(--text-muted)] text-[0.9rem]">Select whether you require a single private bedroom or a full independent flat.</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="form-group">
              <label className="form-label">Housing Type</label>
              <div className="flex gap-4">
                {[
                  { val: 'Room', label: 'Single Room Only' },
                  { val: 'Flat', label: 'Entire Flat/Apartment' }
                ].map(item => (
                  <button
                    key={item.val} onClick={() => setRoomType(item.val)} type="button"
                    className={`${selBtnClass(roomType === item.val)} flex flex-col gap-1 p-5`}
                  >
                    <strong>{item.label}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Bed sharing preference</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { val: 'Single', label: 'Single (Solo Room)' },
                  { val: 'Shared', label: 'Shared (Roommate)' },
                  { val: 'Private', label: 'Private Layout (No sharing)' }
                ].map(item => (
                  <button
                    key={item.val} onClick={() => setSharing(item.val)} type="button"
                    className={`${selBtnClass(sharing === item.val)} flex-1 min-w-[150px]`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={stepNavClass}>
            <button onClick={prevStep} className="btn btn-outline flex gap-1"><ChevronLeft size={18} /> Back</button>
            <button onClick={nextStep} className="btn btn-primary flex gap-1">Next Step <ChevronRight size={18} /></button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="card shadow-lg border border-[var(--border-color)] bg-[var(--bg-card)] animate-fade-in flex flex-col gap-10 p-8 sm:p-12 rounded-[var(--radius-lg)]">
          <div>
            <h2 className="text-[1.4rem] mb-2">Step 3: Essential Facilities</h2>
            <p className="text-[var(--text-muted)] text-[0.9rem]">Check any facilities that are non-negotiable for you. Our model penalizes listings missing these items.</p>
          </div>

          <div className="form-group text-left">
            <label className="form-label block mb-4">Required Amenities</label>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
              {allFacilities.map((fac, idx) => {
                const isSelected = amenities.includes(fac);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleAmenity(fac)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border cursor-pointer transition-all ${isSelected
                      ? 'bg-[var(--secondary-light)] border-[var(--secondary)]'
                      : 'bg-transparent border-[var(--border-color)]'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center text-white transition-colors ${isSelected ? 'bg-[var(--secondary)] border-[var(--secondary)]' : 'bg-transparent border-[var(--border-color)]'
                      }`}>
                      {isSelected && <Check size={14} />}
                    </div>
                    <span className="text-[0.92rem] font-medium">{fac}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={stepNavClass}>
            <button onClick={prevStep} className="btn btn-outline flex gap-1"><ChevronLeft size={18} /> Back</button>
            <button onClick={nextStep} className="btn btn-primary flex gap-1">Next Step <ChevronRight size={18} /></button>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="card shadow-lg border border-[var(--border-color)] bg-[var(--bg-card)] animate-fade-in flex flex-col gap-10 p-8 sm:p-12 rounded-[var(--radius-lg)]">
          <div>
            <h2 className="text-[1.4rem] mb-2">Step 4: College / Campus Proximity</h2>
            <p className="text-[var(--text-muted)] text-[0.9rem]">Choose your central campus. Rooms with shorter walking times are scored highly.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Central Campus location</label>
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="form-input w-full p-4 text-[1rem] cursor-pointer"
            >
              <option value="">None / Not a student</option>
              {collegesList.map((col, idx) => (
                <option key={idx} value={col}>🎓 {col}</option>
              ))}
            </select>
            <span className="text-[0.85rem] text-[var(--text-light)] mt-2 block">
              Our model computes walk distances directly to this landmark location using geometric bounds.
            </span>
          </div>

          <div className={stepNavClass}>
            <button onClick={prevStep} className="btn btn-outline flex gap-1"><ChevronLeft size={18} /> Back</button>
            <button onClick={handleRunAssessment} className="btn btn-secondary flex gap-1">
              <Sparkles size={18} style={{ fill: 'white' }} /> Calculate Recommendations
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Loading */}
      {step === 5 && (
        <div className="card shadow-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-center animate-fade-in flex flex-col items-center gap-10 py-20 px-10 rounded-[var(--radius-lg)]">
          <div className="relative w-20 h-20">
            <div className="w-full h-full rounded-full border-4 border-[var(--primary-light)] border-t-[var(--primary)] animate-spin" />
            <Cpu size={30} className="absolute top-[25px] left-[25px] text-[var(--primary)]" />
          </div>
          <div>
            <h3 className="mb-2">Evaluating NestFinder AI Model</h3>
            <p className="text-[var(--text-light)] text-[0.85rem]">Embedding Transformer: <code>all-MiniLM-L6-v2</code></p>
          </div>
          <div className="bg-[var(--bg-app)] p-4 rounded-[var(--radius-md)] border border-[var(--border-color)] w-full max-w-[500px] text-[0.82rem] font-mono text-[var(--primary)]">
            {aiLoadingText}
          </div>
        </div>
      )}

      {/* STEP 6: Results */}
      {step === 6 && (
        <div className="flex flex-col gap-8 animate-fade-in">

          {/* Results Header */}
          <div className="glass p-6 rounded-[var(--radius-lg)] flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-[1.35rem] flex items-center gap-2">
                <Sparkles size={20} style={{ color: 'var(--accent)', fill: 'var(--accent)' }} />
                AI Match Score Report
              </h2>
              <p className="text-[0.85rem] text-[var(--text-muted)]">
                Preferences: Rs. {budget.toLocaleString()} • {roomType} • {sharing} sharing • {college ? poiNameShort(college) : 'No College'}
              </p>
              {aiError && (
                <p className="text-[0.78rem] text-[var(--accent)] mt-1">⚠ {aiError}</p>
              )}
            </div>
            <button onClick={() => setStep(1)} className="btn btn-outline btn-sm">Modify Preferences</button>
          </div>

          {/* Results Grid - Full Width, No Sidebar */}
          <div className="flex flex-col gap-8 w-full mt-4">
            <h3 className="text-[1.4rem] text-[var(--text-main)] font-extrabold mb-2">Matched Listings ({aiResults.length})</h3>

            {aiResults.length === 0 ? (
              <div className="p-10 text-center border-2 dashed border-[var(--border-color)] rounded-[var(--radius-lg)] text-[var(--text-muted)]">
                <p className="text-[1.1rem]">No listings verified inside the database.</p>
              </div>
            ) : (
              aiResults.map(item => {
                const reasons = generateMatchExplanations(item);
                return (
                  <div key={item.id} className="card shadow-lg hover:shadow-xl hover:border-[var(--primary)] transition-all duration-300 p-0 overflow-hidden bg-[var(--bg-card)] rounded-[var(--radius-lg)]">
                    <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-full">

                      {/* Image side */}
                      <div className="relative h-[250px] md:h-full overflow-hidden">
                        <img src={item.images[0]} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" alt={item.title} />
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-[var(--primary)] to-[#7c3aed] text-white font-extrabold text-[1rem] px-4 py-2 rounded-full shadow-lg border-2 border-white/20 flex items-center gap-2">
                          <Sparkles size={16} />
                          {item.matchScore}% Match
                        </div>
                      </div>

                      {/* Details side */}
                      <div className="p-8 flex flex-col justify-between">
                        <div className="text-left">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[0.8rem] font-bold text-[var(--primary)] uppercase tracking-wider bg-[var(--primary-light)] px-3 py-1 rounded-full">
                              {item.sharing} • {item.type}
                            </span>
                            <strong className="text-[1.4rem] text-[var(--text-main)] font-extrabold">Rs. {item.price.toLocaleString('en-IN')}/mo</strong>
                          </div>
                          
                          <h4 className="text-[1.5rem] font-extrabold my-2 leading-tight">
                            <Link to={`/room/${item.id}`} className="text-[var(--text-main)] hover:text-[var(--primary)] transition-colors">{item.title}</Link>
                          </h4>
                          <p className="text-[0.95rem] text-[var(--text-muted)] mb-4 flex items-center gap-1">📍 {item.location}</p>

                          {/* Match Reasons - Highlighted prominently */}
                          <div className="mt-4 flex flex-col gap-3 p-4 bg-[rgba(16,185,129,0.05)] rounded-[var(--radius-md)] border border-[rgba(16,185,129,0.15)]">
                            <strong className="text-[0.85rem] uppercase text-[var(--text-muted)] tracking-wider">Why it matches:</strong>
                            {reasons.map((r, i) => (
                              <div key={i} className={`flex items-start gap-3 ${r.positive ? 'text-[var(--secondary)]' : 'text-[var(--danger)]'}`}>
                                <span className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white ${r.positive ? 'bg-[var(--secondary)]' : 'bg-[var(--danger)]'}`}>
                                  {r.positive ? <Check size={14} /> : '✕'}
                                </span>
                                <span className="text-[1.05rem] font-medium leading-snug">{r.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end pt-6 mt-4">
                          <Link to={`/room/${item.id}`} className="btn btn-primary px-8 py-3 text-[1.05rem] font-bold rounded-full shadow-md hover:shadow-lg hover:-translate-y-1 transition-all">
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
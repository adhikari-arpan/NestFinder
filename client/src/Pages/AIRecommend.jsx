import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
import { RoomCard } from '../components/RoomCard';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Check, 
  MapPin, 
  HelpCircle, 
  Brain, 
  Cpu, 
  Compass, 
  X,
  Gauge
} from 'lucide-react';

export const AIRecommend = () => {
  const navigate = useNavigate();
  const { 
    tenantPreferences, 
    setTenantPreferences, 
    getRecommendedListings, 
    calculateRecommendationScore 
  } = useContext(AppContext);

  const [step, setStep] = useState(1); // Steps: 1, 2, 3, 4, 5 (Loading), 6 (Results)
  
  // Local form states initialized with context values
  const [budget, setBudget] = useState(tenantPreferences.budget);
  const [city, setCity] = useState(tenantPreferences.preferredCity);
  const [sharing, setSharing] = useState(tenantPreferences.sharing);
  const [roomType, setRoomType] = useState(tenantPreferences.roomType);
  const [amenities, setAmenities] = useState(tenantPreferences.essentialAmenities);
  const [college, setCollege] = useState(tenantPreferences.poiCollege);

  const [aiLoadingText, setAiLoadingText] = useState('Vectorizing preferences...');
  
  // Available landmarks dropdown
  const collegesList = [
    "Tribhuvan University",
    "Pulchowk Campus",
    "St. Xavier's College Maitighar",
    "Apex College Baneshwor",
    "United Academy Kumaripati",
    "Kathmandu University"
  ];

  // List of all facilities
  const allFacilities = [
    "WiFi", "Hot Water", "Parking", "Furnished", "Kitchen", "Balcony", "Backup Electricity"
  ];

  // Steps handling
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const toggleAmenity = (item) => {
    setAmenities(prev => 
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  // Run Recommendation Simulation
  const handleRunAssessment = () => {
    // Update preferences in global context
    setTenantPreferences({
      budget,
      preferredCity: city,
      sharing,
      roomType,
      essentialAmenities: amenities,
      poiCollege: college
    });

    nextStep(); // Go to step 5 (AI Loading)
  };

  // Simulation AI loading sequences
  useEffect(() => {
    if (step === 5) {
      const timer1 = setTimeout(() => {
        setAiLoadingText("Generating embedding vector representing your preferences...");
      }, 800);
      const timer2 = setTimeout(() => {
        setAiLoadingText("Calculating cosine similarity distances using all-MiniLM-L6-v2 model...");
      }, 1600);
      const timer3 = setTimeout(() => {
        setAiLoadingText("Sorting match listings by density weight matrices...");
      }, 2400);
      const timer4 = setTimeout(() => {
        setStep(6); // Show results
      }, 3200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    } else {
      setAiLoadingText("Vectorizing preferences...");
    }
  }, [step]);

  // Fetch Recommended Results sorted by score
  const recommendedResults = getRecommendedListings();

  // Explain why a room matched
  const generateMatchExplanations = (room) => {
    const reasons = [];
    
    // Budget check
    if (room.price <= budget) {
      reasons.push({ text: `Fits within your budget boundary of Rs. ${budget.toLocaleString()}`, positive: true });
    } else {
      const overAmount = room.price - budget;
      reasons.push({ text: `Rs. ${overAmount.toLocaleString()} over your ideal budget boundary`, positive: false });
    }

    // City check
    if (room.city.toLowerCase() === city.toLowerCase()) {
      reasons.push({ text: `Located in your preferred city (${city})`, positive: true });
    }

    // College POI proximity
    const matchPOI = room.nearbyPOIs.find(poi => 
      poi.type === "College" && 
      (poi.name.toLowerCase().includes(college.toLowerCase()) || 
       college.toLowerCase().includes(poi.name.toLowerCase()))
    );

    if (matchPOI) {
      reasons.push({ text: `Extremely close to ${poiNameShort(college)} (${matchPOI.distance}m distance)`, positive: true });
    }

    // Amenities matches
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

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem', textAlign: 'left', maxWidth: '900px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
          <Brain size={26} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>AI Room Finder Assistant</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Smart preference matching powered by sentence embedding calculations.</p>
        </div>
      </div>

      {/* Progress Tracker bar (visible during steps 1-4) */}
      {step <= 4 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '3rem', backgroundColor: 'var(--bg-card)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          {[
            { num: 1, label: "Budget & Location" },
            { num: 2, label: "Room Spec" },
            { num: 3, label: "Facilities" },
            { num: 4, label: "College Proximity" }
          ].map((s) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: step >= s.num ? 1 : 0.4 }}>
              <span style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                backgroundColor: step === s.num ? 'var(--primary)' : (step > s.num ? 'var(--secondary)' : 'var(--border-color)'),
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                {step > s.num ? <Check size={14} /> : s.num}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'none', sm: 'inline' }} className="step-label">{s.label}</span>
              {s.num < 4 && <div style={{ width: '30px', height: '2px', backgroundColor: 'var(--border-color)', display: 'none', sm: 'block' }} />}
            </div>
          ))}
        </div>
      )}

      {/* Step Components */}

      {/* STEP 1: Budget and City */}
      {step === 1 && (
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Step 1: Budget Boundaries & City</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Set your maximum budget constraints and search zone in Kathmandu Valley.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Preferred City */}
            <div className="form-group">
              <label className="form-label">Preferred City</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {["Lalitpur", "Kathmandu"].map(item => (
                  <button 
                    key={item}
                    onClick={() => setCity(item)}
                    type="button" 
                    className="btn btn-outline"
                    style={{ 
                      flex: 1, 
                      borderColor: city === item ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: city === item ? 'var(--primary-light)' : 'transparent',
                      color: city === item ? 'var(--primary)' : 'inherit'
                    }}
                  >
                    📍 {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Maximum Monthly Budget</label>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Rs. {budget.toLocaleString('en-IN')}</strong>
              </div>
              <input 
                type="range" 
                min="3000" 
                max="40000" 
                step="500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Min: Rs. 3,000 • Max: Rs. 40,000</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button onClick={nextStep} className="btn btn-primary" style={{ display: 'flex', gap: '0.25rem' }}>
              Next Step <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Room Specification */}
      {step === 2 && (
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Step 2: Room Layout</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Select whether you require a single private bedroom or a full independent flat.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Room vs Flat */}
            <div className="form-group">
              <label className="form-label">Housing Type</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {[
                  { val: 'Room', label: 'Single Room Only' },
                  { val: 'Flat', label: 'Entire Flat/Apartment' }
                ].map(item => (
                  <button 
                    key={item.val}
                    onClick={() => setRoomType(item.val)}
                    type="button" 
                    className="btn btn-outline"
                    style={{ 
                      flex: 1, 
                      padding: '1.25rem',
                      borderColor: roomType === item.val ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: roomType === item.val ? 'var(--primary-light)' : 'transparent',
                      color: roomType === item.val ? 'var(--primary)' : 'inherit',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <strong>{item.label}</strong>
                  </button>
                ))}
              </div>
            </div>

            {/* Sharing Preference */}
            <div className="form-group">
              <label className="form-label">Bed sharing preference</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { val: 'Single', label: 'Single (Solo Room)' },
                  { val: 'Shared', label: 'Shared (Roommate)' },
                  { val: 'Private', label: 'Private Layout (No sharing)' }
                ].map(item => (
                  <button 
                    key={item.val}
                    onClick={() => setSharing(item.val)}
                    type="button" 
                    className="btn btn-outline"
                    style={{ 
                      flex: 1, 
                      minWidth: '150px',
                      borderColor: sharing === item.val ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: sharing === item.val ? 'var(--primary-light)' : 'transparent',
                      color: sharing === item.val ? 'var(--primary)' : 'inherit'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button onClick={prevStep} className="btn btn-outline" style={{ display: 'flex', gap: '0.25rem' }}>
              <ChevronLeft size={18} /> Back
            </button>
            <button onClick={nextStep} className="btn btn-primary" style={{ display: 'flex', gap: '0.25rem' }}>
              Next Step <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Essential Facilities */}
      {step === 3 && (
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Step 3: Essential Facilities</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Check any facilities that are non-negotiable for you. Our model penalizes listings missing these items.</p>
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>Required Amenities</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {allFacilities.map((fac, idx) => {
                const isSelected = amenities.includes(fac);
                return (
                  <div 
                    key={idx} 
                    onClick={() => toggleAmenity(fac)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      padding: '0.75rem 1rem', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border-color)', 
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--secondary-light)' : 'transparent',
                      borderColor: isSelected ? 'var(--secondary)' : 'var(--border-color)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '4px', 
                      border: '2px solid var(--border-color)',
                      borderColor: isSelected ? 'var(--secondary)' : 'var(--border-color)',
                      backgroundColor: isSelected ? 'var(--secondary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      {isSelected && <Check size={14} />}
                    </div>
                    <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{fac}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button onClick={prevStep} className="btn btn-outline" style={{ display: 'flex', gap: '0.25rem' }}>
              <ChevronLeft size={18} /> Back
            </button>
            <button onClick={nextStep} className="btn btn-primary" style={{ display: 'flex', gap: '0.25rem' }}>
              Next Step <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: College Proximity */}
      {step === 4 && (
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Step 4: College / Campus Proximity</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose your central campus. Rooms with shorter walking times are scored highly.</p>
          </div>

          <div className="form-group">
            <label className="form-label">Central Campus location</label>
            <select 
              value={college} 
              onChange={(e) => setCollege(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '1rem', fontSize: '1rem', cursor: 'pointer' }}
            >
              <option value="">None / Not a student</option>
              {collegesList.map((col, idx) => (
                <option key={idx} value={col}>🎓 {col}</option>
              ))}
            </select>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
              Our model computes walk distances directly to this landmark location using geometric bounds.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button onClick={prevStep} className="btn btn-outline" style={{ display: 'flex', gap: '0.25rem' }}>
              <ChevronLeft size={18} /> Back
            </button>
            <button onClick={handleRunAssessment} className="btn btn-secondary" style={{ display: 'flex', gap: '0.25rem' }}>
              <Sparkles size={18} style={{ fill: 'white' }} /> Calculate Recommendations
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: AI Loading Simulation */}
      {step === 5 && (
        <div className="card text-center animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '4rem 2rem' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px' }}>
            <div className="spinner" style={{ 
              width: '100%', 
              height: '100%', 
              borderRadius: '50%', 
              border: '4px solid var(--primary-light)', 
              borderTopColor: 'var(--primary)',
              animation: 'spin 1s linear infinite'
            }} />
            <Cpu size={30} style={{ position: 'absolute', top: '25px', left: '25px', color: 'var(--primary)' }} />
          </div>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Evaluating NestFinder AI Model</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Embedding Transformer: <code>all-MiniLM-L6-v2</code></p>
          </div>
          <div style={{ 
            backgroundColor: 'var(--bg-app)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-color)', 
            width: '100%', 
            maxWidth: '500px',
            fontSize: '0.82rem',
            fontFamily: 'monospace',
            color: 'var(--primary)'
          }}>
            {aiLoadingText}
          </div>
        </div>
      )}

      {/* STEP 6: Recommendations Results Dashboard */}
      {step === 6 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
          
          {/* Results Header card */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles style={{ color: 'var(--accent)', fill: 'var(--accent)' }} size={20} />
                AI Match Score Report
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Preferences: Rs. {budget.toLocaleString()} • {roomType} • {sharing} sharing • {college ? poiNameShort(college) : 'No College'}
              </p>
            </div>
            
            <button onClick={() => setStep(1)} className="btn btn-outline btn-sm">
              Modify Preferences
            </button>
          </div>

          {/* Results Grid split: Left matches (3/5), Right statistics summary (2/5) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '2.5rem' }} className="details-grid">
            
            {/* Left Matches List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-light)', fontWeight: 600 }}>Matched Listings ({recommendedResults.length})</h3>
              
              {recommendedResults.length === 0 ? (
                <p>No listings verified inside the database.</p>
              ) : (
                recommendedResults.map(item => {
                  const reasons = generateMatchExplanations(item);
                  return (
                    <div key={item.id} className="card shadow-sm" style={{ padding: 0 }}>
                      
                      {/* Split card inner */}
                      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr' }} className="recommend-item-grid">
                        
                        <div style={{ position: 'relative', height: '100%', minHeight: '180px' }}>
                          <img src={item.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.title} />
                          <div style={{ 
                            position: 'absolute', 
                            top: '10px', 
                            left: '10px', 
                            background: 'rgba(99, 102, 241, 0.95)', 
                            color: 'white', 
                            fontWeight: 800, 
                            fontSize: '0.8rem', 
                            padding: '0.3rem 0.6rem', 
                            borderRadius: 'var(--radius-full)' 
                          }}>
                            {item.matchScore}% Match
                          </div>
                        </div>

                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'space-between' }}>
                          <div style={{ textAlign: 'left' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                              {item.sharing} • {item.type}
                            </span>
                            <h4 style={{ fontSize: '1.05rem', margin: '2px 0' }}>
                              <Link to={`/room/${item.id}`} style={{ color: 'var(--text-main)' }}>{item.title}</Link>
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {item.location}</p>
                            
                            {/* Score Breakdown lists */}
                            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {reasons.slice(0, 3).map((r, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: r.positive ? 'var(--secondary)' : 'var(--danger)' }}>
                                  <span>{r.positive ? '✓' : '⚠'}</span>
                                  <span>{r.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                            <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>Rs. {item.price.toLocaleString('en-IN')}/mo</strong>
                            <Link to={`/room/${item.id}`} className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                              View Room
                            </Link>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Summary Statistics Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-light)', fontWeight: 600 }}>Algorithm Insights</h3>
              
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderColor: 'var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                  <Cpu size={22} />
                  <strong style={{ fontSize: '0.95rem' }}>Sentence Embeddings</strong>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  NestFinder calculates vector coefficients representing location, cost constraints, and wifi variables, running them against database entries.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>MATCH METRICS FACTOR:</div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>Budget Constraint Weight:</span>
                    <strong style={{ color: 'var(--primary)' }}>40%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>Proximity to Campus:</span>
                    <strong style={{ color: 'var(--primary)' }}>25%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>Amenity Availability:</span>
                    <strong style={{ color: 'var(--primary)' }}>20%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span>Role / Space Layout:</span>
                    <strong style={{ color: 'var(--primary)' }}>15%</strong>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  💡 Closer rooms with lower prices receive exponential multipliers to reflect maximum value for students.
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Styled css elements */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .recommend-item-grid {
            grid-template-columns: 1fr !important;
          }
          .details-grid {
            grid-template-columns: 1fr !important;
          }
          .step-label {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

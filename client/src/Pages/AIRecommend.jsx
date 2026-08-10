import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import { ProgressTracker } from "../components/ai-recommend/ProgressTracker";
import { StepBudgetCity } from "../components/ai-recommend/StepBudgetCity";
import { StepRoomLayout } from "../components/ai-recommend/StepRoomLayout";
import { StepFacilities } from "../components/ai-recommend/StepFacilities";
import { StepLocation } from "../components/ai-recommend/StepLocation";
import { LoadingStep } from "../components/ai-recommend/LoadingStep";
import { ResultsStep } from "../components/ai-recommend/ResultsStep";
import { Brain } from "lucide-react";

export const AIRecommend = () => {
  const navigate = useNavigate();
  const {
    tenantPreferences,
    setTenantPreferences,
    getAIRecommendedListings,
    aiError,
    checkDistanceAccess,
    isRadiusUpgrade,
    getRadiusPaymentAmount,
    paidRadiusAccess,
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
  const [radius, setRadius] = useState(tenantPreferences.radius || 1000); // meters
  const [aiLoadingText, setAiLoadingText] = useState(
    "Vectorizing preferences...",
  );

  const [activePreferences, setActivePreferences] = useState(null);
  const [aiResults, setAiResults] = useState([]);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const toggleAmenity = (item) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item],
    );
  };

  const executeRecommendationFlow = (prefs) => {
    setTenantPreferences(prefs);
    setActivePreferences(prefs);
    nextStep();
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

    // Verify distance tier payment
    const isPaid = checkDistanceAccess(location, radius);
    if (!isPaid) {
      const latStr = location?.lat || 27.6644;
      const lngStr = location?.lng || 85.3188;
      const nameStr = encodeURIComponent(location?.name || "Selected Point");
      const price = getRadiusPaymentAmount(location, radius);
      const upgradeParams = isRadiusUpgrade(location, radius)
        ? `&upgrade=true&prevRadius=${paidRadiusAccess.activeRadius}`
        : "";
      navigate(
        `/payment?type=distance_radius&radius=${radius}&amount=${price}&lat=${latStr}&lng=${lngStr}&name=${nameStr}${upgradeParams}`,
      );
    } else {
      executeRecommendationFlow(prefs);
    }
  };

  useEffect(() => {
    if (step === 5) {
      if (!activePreferences) return;

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
    }
  }, [step, activePreferences, getAIRecommendedListings]);

  return (
    <div
      className={`container ${step === 4 ? "min-h-[140vh]" : "min-h-screen"} max-w-300 bg-linear-to-b from-[rgba(99,102,241,0.03)] to-transparent px-4 pb-32 text-left sm:px-10`}
      style={{ paddingTop: "40px" }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 style={{ marginBottom: '60px' }}>">
        <div className="flex size-16 -rotate-6 transform items-center justify-center rounded-lg bg-linear-to-br from-(--primary) to-[#7c3aed] text-white shadow-lg">
          <Brain size={42} />
        </div>
        <div>
          <h1 className="m-0 bg-linear-to-r from-(--primary) to-(--secondary) bg-clip-text text-[2rem] leading-tight font-extrabold text-transparent sm:text-[2.5rem]">
            AI Room Finder Assistant
          </h1>
          <p
            className="mt-2 text-[1rem] font-medium text-(--text-muted)"
            style={{ marginBottom: "20px" }}
          >
            Smart preference matching powered by Next-Gen AI.
          </p>
        </div>
      </div>

      <ProgressTracker step={step} />

      {step === 1 && (
        <StepBudgetCity
          city={city}
          setCity={setCity}
          budget={budget}
          setBudget={setBudget}
          onNext={nextStep}
          onBackToDashboard={() => navigate("/dashboard/tenant")}
        />
      )}

      {step === 2 && (
        <StepRoomLayout
          roomType={roomType}
          setRoomType={setRoomType}
          sharing={sharing}
          setSharing={setSharing}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {step === 3 && (
        <StepFacilities
          amenities={amenities}
          toggleAmenity={toggleAmenity}
          onNext={nextStep}
          onBack={prevStep}
        />
      )}

      {step === 4 && (
        <StepLocation
          location={location}
          setLocation={setLocation}
          radius={radius}
          setRadius={setRadius}
          onBack={prevStep}
          onSubmit={handleRunAssessment}
        />
      )}

      {step === 5 && <LoadingStep loadingText={aiLoadingText} />}

      {step === 6 && (
        <ResultsStep
          aiResults={aiResults}
          aiError={aiError}
          budget={budget}
          roomType={roomType}
          sharing={sharing}
          city={city}
          amenities={amenities}
          location={location}
          onModify={() => setStep(1)}
        />
      )}
    </div>
  );
};

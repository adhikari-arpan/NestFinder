import { Sparkles, ChevronLeft } from "lucide-react";
import { LocationRadiusPicker } from "../LocationRadiusPicker";
import { stepNavClass } from "./stepStyles";

export const StepLocation = ({
  location,
  setLocation,
  radius,
  setRadius,
  onBack,
  onSubmit,
}) => {
  return (
    <div className="card animate-fade-in flex flex-col gap-10 rounded-lg border border-(--border-color) bg-(--bg-card) p-8 shadow-lg sm:p-12">
      <div>
        <h2 className="mb-2 text-[1.4rem]">Step 4: Location & Distance Tier</h2>
        <p className="text-[0.9rem] text-(--text-muted)">
          Select your central point of interest and desired search radius tier.
          Each distance tier carries a personalized recommendation fee valid for 48 hours.
        </p>
      </div>

      <LocationRadiusPicker
        location={location}
        onLocationChange={setLocation}
        radius={radius}
        onRadiusChange={setRadius}
      />

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

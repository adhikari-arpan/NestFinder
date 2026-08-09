import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { stepNavClass } from "./stepStyles";

const ALL_FACILITIES = [
  "WiFi",
  "Hot Water",
  "Parking",
  "Furnished",
  "Kitchen",
  "Balcony",
  "Backup Electricity",
];

export const StepFacilities = ({
  amenities,
  toggleAmenity,
  onNext,
  onBack,
}) => {
  return (
    <div className="card animate-fade-in rounded-lg) flex flex-col gap-10 border border-(--border-color) bg-(--bg-card) p-8 shadow-lg sm:p-12">
      <div>
        <h2 className="mb-2 text-[1.4rem]">Step 3: Essential Facilities</h2>
        <p className="text-[0.9rem] text-(--text-muted)">
          Check any facilities that are non-negotiable for you. Our model
          penalizes listings missing these items.
        </p>
      </div>

      <div className="form-group text-left">
        <label className="form-label mb-4 block">Required Amenities</label>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          {ALL_FACILITIES.map((fac, idx) => {
            const isSelected = amenities.includes(fac);
            return (
              <div
                key={idx}
                onClick={() => toggleAmenity(fac)}
                className={`rounded-md)] flex cursor-pointer items-center gap-3 border px-4 py-3 transition-all ${
                  isSelected
                    ? "border-(--secondary) bg-(--secondary-light)"
                    : "border-(--border-color) bg-transparent"
                }`}
              >
                <div
                  className={`flex size-5 items-center justify-center rounded-sm border-2 text-white transition-colors ${
                    isSelected
                      ? "border-(--secondary) bg-(--secondary)"
                      : "border-(--border-color) bg-transparent"
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
        <button onClick={onBack} className="btn btn-outline flex gap-1">
          <ChevronLeft size={18} /> Back
        </button>
        <button onClick={onNext} className="btn btn-primary flex gap-1">
          Next Step <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

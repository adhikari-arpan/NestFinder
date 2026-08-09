import { ChevronRight, ChevronLeft } from "lucide-react";
import { stepNavClass, selBtnClass } from "./stepStyles";

const HOUSING_TYPES = [
  { val: "Room", label: "Single Room Only" },
  { val: "Flat", label: "Entire Flat/Apartment" },
];

const SHARING_OPTIONS = [
  { val: "Single", label: "Single (Solo Room)" },
  { val: "Shared", label: "Shared (Roommate)" },
  { val: "Private", label: "Private Layout (No sharing)" },
];

export const StepRoomLayout = ({
  roomType,
  setRoomType,
  sharing,
  setSharing,
  onNext,
  onBack,
}) => {
  return (
    <div className="card animate-fade-in rounded-lg flex flex-col gap-10 border border-(--border-color) bg-(--bg-card) p-8 shadow-lg sm:p-12">
      <div>
        <h2 className="mb-2 text-[1.4rem]">Step 2: Room Layout</h2>
        <p className="text-[0.9rem] text-(--text-muted)">
          Select whether you require a single private bedroom or a full
          independent flat.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="form-group">
          <label className="form-label">Housing Type</label>
          <div className="flex gap-4">
            {HOUSING_TYPES.map((item) => (
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
            {SHARING_OPTIONS.map((item) => (
              <button
                key={item.val}
                onClick={() => setSharing(item.val)}
                type="button"
                className={`${selBtnClass(sharing === item.val)} min-w-37.5S flex-1`}
              >
                {item.label}
              </button>
            ))}
          </div>
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

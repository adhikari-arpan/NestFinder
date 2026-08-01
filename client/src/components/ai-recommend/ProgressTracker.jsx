import { Check } from "lucide-react";

const STEPS = [
  { num: 1, label: "Budget & Location" },
  { num: 2, label: "Room Spec" },
  { num: 3, label: "Facilities" },
  { num: 4, label: "Location" },
];

export const ProgressTracker = ({ step }) => {
  if (step > 4) return null;

  return (
    <div
      className="flex items-center justify-between gap-5 rounded-md border border-(--border-color) bg-(--bg-card) px-8 py-6"
      style={{ marginBottom: "50px" }}
    >
      {STEPS.map((s) => (
        <div
          key={s.num}
          className={`flex items-center gap-2 transition-opacity ${step >= s.num ? "opacity-100" : "opacity-40"}`}
        >
          <span
            className={`flex size-7 items-center justify-center rounded-full text-[0.85rem] font-bold text-white ${
              step === s.num
                ? "bg-(--primary)"
                : step > s.num
                  ? "bg-(--secondary)"
                  : "bg-(--border-color)"
            }`}
          >
            {step > s.num ? <Check size={14} /> : s.num}
          </span>
          <span className="hidden text-[0.85rem] font-semibold sm:inline">
            {s.label}
          </span>
          {s.num < 4 && (
            <div className="hidden h-0.5 w-7.5 bg-(--border-color) sm:block" />
          )}
        </div>
      ))}
    </div>
  );
};

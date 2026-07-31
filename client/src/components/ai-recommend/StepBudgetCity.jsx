import { ChevronRight } from "lucide-react";

const CITIES = ["Kathmandu", "Lalitpur", "Bhaktapur"];

export const StepBudgetCity = ({ city, setCity, budget, setBudget, onNext }) => {
  return (
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
            {CITIES.map((c) => (
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
        <button onClick={onNext} className="btn btn-primary flex gap-1">
          Next Step <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

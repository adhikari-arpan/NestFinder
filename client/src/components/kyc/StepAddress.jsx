import { ChevronRight, ChevronLeft } from "lucide-react";
import { stepNavClass } from "./kycStepStyles";
import { NEPAL_PROVINCES } from "./nepalProvinces";

export const StepAddress = ({
  province,
  setProvince,
  district,
  setDistrict,
  municipality,
  setMunicipality,
  tole,
  setTole,
  onNext,
  onBack,
}) => {
  const canProceed =
    province.trim() && district.trim() && municipality.trim() && tole.trim();

  return (
    <div className="card animate-fade-in flex flex-col gap-10 rounded-lg border border-(--border-color) bg-(--bg-card) p-8 shadow-lg sm:p-12">
      <div>
        <h2 className="mb-2 text-[1.4rem]">Step 2: Permanent Address</h2>
        <p className="text-[0.9rem] text-(--text-muted)">
          Your full home address, as it appears on your ID document.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label className="form-label">Province *</label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="form-input"
            >
              <option value="">Select province</option>
              {NEPAL_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">District *</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Kathmandu"
              className="form-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label className="form-label">Municipality *</label>
            <input
              type="text"
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              placeholder="Kathmandu Metropolitan City"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tole / Street *</label>
            <input
              type="text"
              value={tole}
              onChange={(e) => setTole(e.target.value)}
              placeholder="Baneshwor"
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className={stepNavClass}>
        <button onClick={onBack} className="btn btn-outline flex gap-1">
          <ChevronLeft size={18} /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="btn btn-primary flex gap-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next Step <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

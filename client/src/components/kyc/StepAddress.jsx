import { ChevronRight, ChevronLeft } from "lucide-react";
import { stepNavClass } from "./kycStepStyles";
import { NEPAL_PROVINCES, DISTRICTS_BY_PROVINCE, MUNICIPALITIES_BY_DISTRICT } from "../../utils/nepalLocations";

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
  const districtOptions = province ? DISTRICTS_BY_PROVINCE[province] || [] : [];
  const municipalityOptions = district ? MUNICIPALITIES_BY_DISTRICT[district] || [] : [];

  const handleProvinceChange = (value) => {
    setProvince(value);
    setDistrict("");
    setMunicipality("");
  };

  const handleDistrictChange = (value) => {
    setDistrict(value);
    setMunicipality("");
  };

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
              onChange={(e) => handleProvinceChange(e.target.value)}
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
            <select
              value={district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={!province}
              className="form-input"
            >
              <option value="">{province ? "Select district" : "Select province first"}</option>
              {districtOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label className="form-label">Local Level *</label>
            <select
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              disabled={!district}
              className="form-input"
            >
              <option value="">{district ? "Select local level" : "Select district first"}</option>
              {municipalityOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tole / Street *</label>
            <input
              type="text"
              value={tole}
              onChange={(e) => setTole(e.target.value)}
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

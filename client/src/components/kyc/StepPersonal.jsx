import { ChevronRight } from "lucide-react";
import { stepNavClass } from "./kycStepStyles";

export const StepPersonal = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  phone,
  setPhone,
  onNext,
}) => {
  const canProceed = firstName.trim() && lastName.trim() && phone.trim();

  return (
    <div className="card animate-fade-in flex flex-col gap-10 rounded-lg border border-(--border-color) bg-(--bg-card) p-8 shadow-lg sm:p-12">
      <div>
        <h2 className="mb-2 text-[1.4rem]">Step 1: Personal Details</h2>
        <p className="text-[0.9rem] text-(--text-muted)">
          Tell us who you are — this must match your identification document.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ramesh"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Shrestha"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            value={email}
            readOnly
            className="form-input"
            style={{ backgroundColor: "var(--bg-app)", cursor: "not-allowed" }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98XXXXXXXX"
            className="form-input"
          />
        </div>
      </div>

      <div className={stepNavClass}>
        <span />
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

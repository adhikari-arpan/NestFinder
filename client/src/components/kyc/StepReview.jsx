import { ChevronLeft, CheckCircle } from "lucide-react";
import { stepNavClass } from "./kycStepStyles";

const Row = ({ label, value }) => (
  <div className="flex justify-between gap-4 border-b border-(--border-color) py-2 text-[0.88rem]">
    <span className="text-(--text-light)">{label}</span>
    <span className="text-right font-medium text-(--text-main)">
      {value || "—"}
    </span>
  </div>
);

export const StepReview = ({
  data,
  onSubmit,
  onBack,
  isSubmitting,
  submitError,
}) => {
  return (
    <div className="card animate-fade-in flex flex-col gap-8 rounded-lg border border-(--border-color) bg-(--bg-card) p-8 shadow-lg sm:p-12">
      <div>
        <h2 className="mb-2 text-[1.4rem]">Step 5: Review & Submit</h2>
        <p className="text-[0.9rem] text-(--text-muted)">
          Double check everything before submitting for admin review.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <Row label="Full Name" value={`${data.firstName} ${data.lastName}`} />
        <Row label="Email" value={data.email} />
        <Row label="Phone" value={data.phone} />
        <Row
          label="Address"
          value={[data.tole, data.municipality, data.district, data.province]
            .filter(Boolean)
            .join(", ")}
        />
        <Row label="Map Pin" value={`${data.latitude}, ${data.longitude}`} />
        <Row
          label="Document Type"
          value={
            data.documentType === "citizenship"
              ? "Citizenship Certificate"
              : "National ID (NID)"
          }
        />
        <Row label="Document Number" value={data.documentNumber} />
        <Row
          label="Document Front"
          value={
            data.documentFrontFile ? data.documentFrontFile.name : "On file"
          }
        />
        {data.documentType === "citizenship" && (
          <Row
            label="Document Back"
            value={
              data.documentBackFile ? data.documentBackFile.name : "On file"
            }
          />
        )}
        <Row
          label="Utility Bill"
          value={`${data.utilityBillType === "electricity" ? "Electricity" : "Water"} — ${
            data.utilityBillFile ? data.utilityBillFile.name : "On file"
          }`}
        />
        <Row
          label="Selfie"
          value={
            data.selfieFile
              ? data.selfieFile.name
              : data.hasExistingSelfie
                ? "On file"
                : "Not provided"
          }
        />
      </div>

      {submitError && (
        <p className="text-right text-[0.85rem] text-(--danger)">
          {submitError}
        </p>
      )}

      <div className={stepNavClass}>
        <button
          onClick={onBack}
          className="btn btn-outline flex gap-1"
          disabled={isSubmitting}
        >
          <ChevronLeft size={18} /> Back
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="btn btn-primary flex gap-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle size={18} />{" "}
          {isSubmitting ? "Submitting…" : "Submit for Review"}
        </button>
      </div>
    </div>
  );
};

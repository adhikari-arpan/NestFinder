import { useRef, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  CheckCircle,
  X,
} from "lucide-react";
import { stepNavClass } from "./kycStepStyles";
import { validateKycFile } from "../../api/kycApi";

const FileField = ({ label, file, existingUrl, onChange, required }) => {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const validationError = validateKycFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    onChange(f);
  };

  const hasFile = !!file || !!existingUrl;

  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && "*"}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer items-center justify-between rounded-md border-2 border-dashed border-(--border-color) p-4 transition-colors hover:border-(--primary-light)"
      >
        <div className="flex items-center gap-2 text-[0.85rem]">
          {hasFile ? (
            <>
              <CheckCircle size={16} className="text-(--secondary)" />
              <span>
                {file ? file.name : "File on record"}
                {file && existingUrl ? " (replaces existing)" : ""}
              </span>
            </>
          ) : (
            <>
              <Upload size={16} className="text-(--text-light)" />
              <span className="text-(--text-muted)">
                Click to upload (JPG, PNG, or PDF, max 5MB)
              </span>
            </>
          )}
        </div>
        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="text-(--text-light) hover:text-(--danger)"
            aria-label={`Remove ${label}`}
          >
            <X size={16} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        onChange={handleChange}
        className="hidden"
      />
      {error && <p className="mt-1 text-[0.78rem] text-(--danger)">{error}</p>}
    </div>
  );
};

export const StepDocuments = ({
  documentType,
  setDocumentType,
  documentNumber,
  setDocumentNumber,
  documentFrontFile,
  setDocumentFrontFile,
  documentBackFile,
  setDocumentBackFile,
  utilityBillType,
  setUtilityBillType,
  utilityBillFile,
  setUtilityBillFile,
  selfieFile,
  setSelfieFile,
  existing,
  onNext,
  onBack,
}) => {
  const needsBack = documentType === "citizenship";

  const canProceed =
    documentNumber.trim() &&
    (documentFrontFile || existing?.document_front_url) &&
    (!needsBack || documentBackFile || existing?.document_back_url) &&
    (utilityBillFile || existing?.utility_bill_url);

  return (
    <div className="card animate-fade-in flex flex-col gap-8 rounded-lg border border-(--border-color) bg-(--bg-card) p-8 shadow-lg sm:p-12">
      <div>
        <h2 className="mb-2 text-[1.4rem]">Step 4: Identity Documents</h2>
        <p className="text-[0.9rem] text-(--text-muted)">
          Upload a valid identification document and a recent utility bill.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-group">
            <label className="form-label">Document Type *</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="form-input"
            >
              <option value="citizenship">Citizenship Certificate</option>
              <option value="nid">National ID (NID)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Document Number *</label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="e.g. 12-34-56-78901"
              className="form-input"
            />
          </div>
        </div>

        <FileField
          label="Document — Front Side"
          file={documentFrontFile}
          existingUrl={existing?.document_front_url}
          onChange={setDocumentFrontFile}
          required
        />

        {needsBack && (
          <FileField
            label="Document — Back Side"
            file={documentBackFile}
            existingUrl={existing?.document_back_url}
            onChange={setDocumentBackFile}
            required
          />
        )}

        <div className="border-t border-(--border-color) pt-6">
          <div className="form-group">
            <label className="form-label">Utility Bill Type *</label>
            <select
              value={utilityBillType}
              onChange={(e) => setUtilityBillType(e.target.value)}
              className="form-input"
            >
              <option value="electricity">Electricity Bill</option>
              <option value="water">Water Bill</option>
            </select>
          </div>
          <FileField
            label="Home Utility Bill"
            file={utilityBillFile}
            existingUrl={existing?.utility_bill_url}
            onChange={setUtilityBillFile}
            required
          />
        </div>

        <div className="border-t border-(--border-color) pt-6">
          <FileField
            label="Selfie Holding Document (optional)"
            file={selfieFile}
            existingUrl={existing?.selfie_url}
            onChange={setSelfieFile}
          />
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
          Review & Submit <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

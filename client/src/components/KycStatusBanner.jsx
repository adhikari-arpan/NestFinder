import { Link } from "react-router-dom";
import { AlertTriangle, Clock, XCircle } from "lucide-react";

// Shown in the landlord dashboard welcome section. Renders nothing once
// kyc_status is 'approved'.
export const KycStatusBanner = ({ kycStatus, rejectionReason }) => {
  if (!kycStatus || kycStatus === "approved") return null;

  if (kycStatus === "pending") {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-(--radius-md) border border-(--accent) bg-(--accent-light) px-4 py-3 text-[0.88rem] text-(--text-main)">
        <Clock size={20} className="shrink-0 text-(--accent)" />
        <span>Your KYC is under review. We'll notify you once it's decided.</span>
      </div>
    );
  }

  if (kycStatus === "rejected") {
    return (
      <div className="mb-6 flex flex-col gap-2 rounded-(--radius-md) border border-(--danger) bg-(--danger-light) px-4 py-3 text-[0.88rem] text-(--text-main) sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <XCircle size={20} className="mt-0.5 shrink-0 text-(--danger)" />
          <span>
            Your KYC submission was rejected
            {rejectionReason ? `: "${rejectionReason}"` : "."} Please correct and resubmit.
          </span>
        </div>
        <Link to="/kyc" className="btn btn-primary btn-sm w-fit shrink-0">
          Resubmit
        </Link>
      </div>
    );
  }

  // not_submitted
  return (
    <div className="mb-6 flex flex-col gap-2 rounded-(--radius-md) border border-(--accent) bg-(--accent-light) px-4 py-3 text-[0.88rem] text-(--text-main) sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle size={20} className="mt-0.5 shrink-0 text-(--accent)" />
        <span>
          Complete KYC verification to post rooms and unlock full NestFinder functionality.
        </span>
      </div>
      <Link to="/kyc" className="btn btn-primary btn-sm w-fit shrink-0">
        Fill KYC Form
      </Link>
    </div>
  );
};

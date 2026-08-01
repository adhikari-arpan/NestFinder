import { BadgeCheck } from "lucide-react";

// Small verification indicator shown next to a user's name. Filled/colored
// when is_verified, gray "Unverified" otherwise.
export const VerifiedBadge = ({ isVerified }) => {
  return (
    <span
      title={isVerified ? "KYC Verified" : "Not yet KYC verified"}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${
        isVerified
          ? "bg-(--secondary-light) text-(--secondary)"
          : "bg-(--border-color) text-(--text-light)"
      }`}
    >
      <BadgeCheck size={13} />
      {isVerified ? "Verified" : "Unverified"}
    </span>
  );
};

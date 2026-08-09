// Shared style helpers used across the AI Recommend wizard steps.

export const stepNavClass =
  "flex justify-between border-t border-[var(--border-color)] pt-8 mt-4";

export const selBtnClass = (active) =>
  `btn flex-1 transition-all duration-200 border-2 ${active
    ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-md transform scale-[1.02]"
    : "border-[var(--border-color)] bg-transparent hover:border-[var(--primary-light)]"
  }`;

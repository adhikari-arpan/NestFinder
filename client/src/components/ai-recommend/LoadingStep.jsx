import { Cpu } from "lucide-react";

export const LoadingStep = ({ loadingText }) => {
  return (
    <div className="card animate-fade-in flex flex-col items-center gap-10 rounded-[var(--radius-lg)] border border-[var(--border-color)] bg-[var(--bg-card)] px-10 py-20 text-center shadow-lg">
      <div className="relative size-20">
        <div className="size-full animate-spin rounded-full border-4 border-[var(--primary-light)] border-t-[var(--primary)]" />
        <Cpu
          size={30}
          className="absolute top-[25px] left-[25px] text-[var(--primary)]"
        />
      </div>
      <div>
        <h3 className="mb-2">Evaluating NestFinder AI Model</h3>
        <p className="text-[0.85rem] text-[var(--text-light)]">
          Embedding Transformer: <code>all-MiniLM-L6-v2</code>
        </p>
      </div>
      <div className="w-full max-w-[500px] rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--bg-app)] p-4 font-mono text-[0.82rem] text-[var(--primary)]">
        {loadingText}
      </div>
    </div>
  );
};

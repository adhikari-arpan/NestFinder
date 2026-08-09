import { Cpu } from "lucide-react";

export const LoadingStep = ({ loadingText }) => {
  return (
    <div className="card animate-fade-in rounded-lg) flex flex-col items-center gap-10 border border-(--border-color) bg-(--bg-card) px-10 py-20 text-center shadow-lg">
      <div className="relative size-20">
        <div className="size-full animate-spin rounded-full border-4 border-(--primary-light) border-t-(--primary)" />
        <Cpu
          size={30}
          className="absolute top-6.25 left-6.25 text-(--primary)"
        />
      </div>
      <div>
        <h3 className="mb-2">Evaluating NestFinder AI Model</h3>
        <p className="text-[0.85rem] text-(--text-light)">
          Embedding Transformer: <code>all-MiniLM-L6-v2</code>
        </p>
      </div>
      <div className="w-full max-w-125 rounded-md border border-(--border-color) bg-(--bg-app) p-4 font-mono text-[0.82rem] text-(--primary)">
        {loadingText}
      </div>
    </div>
  );
};

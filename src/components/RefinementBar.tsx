import { Loader2, Minimize2, RefreshCw, Zap } from 'lucide-react';
import type { RefinementMode } from '../lib/shortcraft';

interface RefinementBarProps {
  activeRefinement: RefinementMode | null;
  isLoading: boolean;
  onRefine: (mode: RefinementMode) => void;
}

export function RefinementBar({
  activeRefinement,
  isLoading,
  onRefine,
}: RefinementBarProps) {
  const actions: Array<{
    mode: RefinementMode;
    label: string;
    icon: typeof Minimize2;
  }> = [
    { mode: 'shorter', label: 'Make Shorter', icon: Minimize2 },
    { mode: 'punchier', label: 'More Punchy', icon: Zap },
    { mode: 'regenerate', label: 'Regenerate', icon: RefreshCw },
  ];

  return (
    <div
      role="group"
      aria-label="Quick script refinements"
      className="flex flex-wrap items-center gap-2"
    >
      {actions.map(({ mode, label, icon: Icon }) => {
        const running = isLoading && activeRefinement === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onRefine(mode)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-[#161A23] px-3 py-2 text-xs font-medium text-slate-200 hover:border-white/[0.22] hover:text-white transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F43F5E]" aria-hidden="true" />
            ) : (
              <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            )}
            <span>{running ? 'Updating...' : label}</span>
          </button>
        );
      })}
    </div>
  );
}

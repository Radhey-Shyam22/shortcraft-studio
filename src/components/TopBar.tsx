import { History } from 'lucide-react';

interface TopBarProps {
  hasPackage: boolean;
  historyCount: number;
  onOpenHistory: () => void;
}

export function TopBar({
  hasPackage,
  historyCount,
  onOpenHistory,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#090B0F]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        <a
          href="#studio-top"
          className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] rounded-md"
        >
          ShortCraft Studio
        </a>

        <nav
          aria-label="Primary sections"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400"
        >
          <a
            href="#studio-inputs"
            className="hover:text-white transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] rounded"
          >
            Brief
          </a>
          <a
            href={hasPackage ? '#section-hooks' : '#studio-output'}
            className="hover:text-white transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] rounded"
          >
            Hooks
          </a>
          <a
            href={hasPackage ? '#section-script' : '#studio-output'}
            className="hover:text-white transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] rounded"
          >
            Script
          </a>
          <a
            href={hasPackage ? '#section-thumbnail' : '#studio-output'}
            className="hover:text-white transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] rounded"
          >
            Thumbnail
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-[#11141B] px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-white/[0.22] hover:bg-[#161A23] hover:text-white transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E]"
          >
            <History className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>Saved Drafts</span>
            <span className="font-mono tabular-nums text-slate-400">({historyCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}

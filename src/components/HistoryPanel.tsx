import { Trash2, X, FolderOpen } from 'lucide-react';
import { formatShortTimestamp, type ShortPackage } from '../lib/shortcraft';

interface HistoryPanelProps {
  isOpen: boolean;
  items: readonly ShortPackage[];
  activeDraftId?: string;
  onClose: () => void;
  onSelectDraft: (draft: ShortPackage) => void;
  onDeleteDraft: (id: string) => void;
  onClearAll: () => void;
}

export function HistoryPanel({
  isOpen,
  items,
  activeDraftId,
  onClose,
  onSelectDraft,
  onDeleteDraft,
  onClearAll,
}: HistoryPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Saved Drafts History"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-[#0D1017] shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-white">
              Saved Drafts
            </h2>
            <p className="text-xs text-slate-400 tabular-nums">
              {items.length} {items.length === 1 ? 'package' : 'packages'} saved locally
            </p>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="rounded-lg border border-white/[0.08] px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:border-red-500/40 hover:text-red-300 transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E]"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close saved drafts panel"
              className="rounded-lg border border-white/[0.08] p-2 text-slate-400 hover:border-white/[0.2] hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <FolderOpen className="mb-3 h-8 w-8 text-slate-600" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-200">
                No saved drafts yet
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Every short-form package you generate is automatically saved here for quick reuse.
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5" aria-label="Saved short-form packages">
              {items.map((item) => {
                const isActive = item.id === activeDraftId;
                return (
                  <li
                    key={item.id}
                    className={`rounded-xl border p-3.5 transition-colors duration-150 ${
                      isActive
                        ? 'border-[#F43F5E]/60 bg-[#F43F5E]/[0.07]'
                        : 'border-white/[0.08] bg-[#11141B] hover:border-white/[0.16]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectDraft(item);
                          onClose();
                        }}
                        className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] rounded"
                      >
                        <p className="text-sm font-medium leading-snug text-white line-clamp-2">
                          {item.topic}
                        </p>
                        <p className="mt-1.5 text-xs text-slate-400 tabular-nums">
                          <span>{item.platform}</span>
                          <span aria-hidden="true" className="mx-1.5 text-slate-600">
                            ·
                          </span>
                          <span>{item.duration}s</span>
                          <span aria-hidden="true" className="mx-1.5 text-slate-600">
                            ·
                          </span>
                          <span>{item.language}</span>
                          <span aria-hidden="true" className="mx-1.5 text-slate-600">
                            ·
                          </span>
                          <span>{formatShortTimestamp(item.createdAt)}</span>
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteDraft(item.id)}
                        aria-label={`Delete draft "${item.topic}"`}
                        className="shrink-0 rounded-lg border border-transparent p-2 text-slate-500 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E]"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

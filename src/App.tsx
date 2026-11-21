import { useEffect, useState } from 'react';
import { AlertCircle, Film, RotateCcw } from 'lucide-react';
import { GeneratorForm } from './components/GeneratorForm';
import { HistoryPanel } from './components/HistoryPanel';
import { HooksSection } from './components/HooksSection';
import { OutputSkeleton } from './components/OutputSkeleton';
import { RefinementBar } from './components/RefinementBar';
import { ScriptSection } from './components/ScriptSection';
import { ThumbnailSection } from './components/ThumbnailSection';
import { TopBar } from './components/TopBar';
import {
  HISTORY_INIT_KEY,
  HISTORY_STORAGE_KEY,
  STARTER_DRAFT,
  removeDraftFromHistory,
  upsertDraftInHistory,
  validateTopic,
  type DurationSeconds,
  type LanguageStyle,
  type Platform,
  type RefinementMode,
  type ShortPackage,
  type ToneOption,
  type TopicPreset,
} from './lib/shortcraft';

function loadInitialHistory(): ShortPackage[] {
  if (typeof window === 'undefined') {
    return [STARTER_DRAFT];
  }
  try {
    const initialized = window.localStorage.getItem(HISTORY_INIT_KEY);
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!initialized && !raw) {
      const seed = [STARTER_DRAFT];
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(seed));
      window.localStorage.setItem(HISTORY_INIT_KEY, '1');
      return seed;
    }
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ShortPackage[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<Platform>('YouTube Shorts');
  const [duration, setDuration] = useState<DurationSeconds>(25);
  const [language, setLanguage] = useState<LanguageStyle>('Hinglish');
  const [tone, setTone] = useState<ToneOption>('Energetic & Curious');

  const [currentPackage, setCurrentPackage] = useState<ShortPackage | null>(null);
  const [history, setHistory] = useState<ShortPackage[]>(loadInitialHistory);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [activeRefinement, setActiveRefinement] = useState<RefinementMode | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      window.localStorage.setItem(HISTORY_INIT_KEY, '1');
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [history]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isHistoryOpen) {
        setIsHistoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHistoryOpen]);

  const handleSelectPreset = (preset: TopicPreset) => {
    setTopic(preset.topic);
    setPlatform(preset.suggestedPlatform);
    setDuration(preset.suggestedDuration);
    setLanguage(preset.suggestedLanguage);
    setTone(preset.suggestedTone);
    setValidationError(null);
    setApiError(null);
  };

  const runGeneration = async (refinement?: RefinementMode) => {
    const topicToUse = refinement && currentPackage ? currentPackage.topic : topic;
    const check = validateTopic(topicToUse);
    if (!check.valid) {
      setValidationError(check.error ?? 'Please enter a valid topic.');
      return;
    }

    setValidationError(null);
    setApiError(null);
    setIsLoading(true);
    setActiveRefinement(refinement ?? null);

    const requestPayload = {
      topic: check.normalized,
      platform: refinement && currentPackage ? currentPackage.platform : platform,
      duration: refinement && currentPackage ? currentPackage.duration : duration,
      language: refinement && currentPackage ? currentPackage.language : language,
      tone: refinement && currentPackage ? currentPackage.tone : tone,
      refinement,
      previousPackage: refinement && currentPackage ? currentPackage : undefined,
    };

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      const data = (await response.json().catch(() => ({}))) as {
        package?: ShortPackage;
        error?: string;
      };

      if (!response.ok || !data.package) {
        const statusHint =
          response.status === 504 || response.status === 502
            ? `The request timed out (HTTP ${response.status}). Please tap Retry.`
            : `Unable to generate your package right now (HTTP ${response.status}). Please try again.`;
        throw new Error(data.error || statusHint);
      }

      setCurrentPackage(data.package);
      setHistory((prev) => upsertDraftInHistory(prev, data.package!));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Network error while generating. Please check your connection and try again.';
      setApiError(message);
    } finally {
      setIsLoading(false);
      setActiveRefinement(null);
    }
  };

  const handleLoadDraft = (draft: ShortPackage) => {
    setTopic(draft.topic);
    setPlatform(draft.platform);
    setDuration(draft.duration);
    setLanguage(draft.language);
    setTone(draft.tone);
    setCurrentPackage(draft);
    setValidationError(null);
    setApiError(null);
  };

  const handleDeleteDraft = (id: string) => {
    setHistory((prev) => removeDraftFromHistory(prev, id));
    if (currentPackage?.id === id) {
      setCurrentPackage(null);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    if (currentPackage) {
      setCurrentPackage(null);
    }
  };

  return (
    <div id="studio-top" className="min-h-screen bg-[#090B0F] text-[#F3F4F6]">
      <TopBar
        hasPackage={Boolean(currentPackage)}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      <main className="mx-auto max-w-[1360px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[410px_minmax(0,1fr)] xl:grid-cols-[440px_minmax(0,1fr)]">
          <div className="space-y-4 lg:sticky lg:top-16 lg:self-start">
            <div className="space-y-1.5">
              <h1 className="font-display text-2xl font-bold tracking-tight text-white text-balance">
                Craft high-retention shorts in one pass
              </h1>
              <p className="text-xs leading-relaxed text-slate-400 tracking-[0.01em] sm:text-sm">
                Five first-3-second hooks, a time-blocked script, and thumbnail-title synergy from one idea.
              </p>
            </div>

            <GeneratorForm
              topic={topic}
              platform={platform}
              duration={duration}
              language={language}
              tone={tone}
              isLoading={isLoading}
              validationError={validationError}
              onTopicChange={(value) => {
                setTopic(value);
                if (validationError) setValidationError(null);
              }}
              onPlatformChange={setPlatform}
              onDurationChange={setDuration}
              onLanguageChange={setLanguage}
              onToneChange={setTone}
              onSelectPreset={handleSelectPreset}
              onSubmit={() => runGeneration()}
            />
          </div>

          <div id="studio-output" className="min-w-0 space-y-8">
            {apiError && (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-xl border border-red-500/35 bg-red-950/25 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                    aria-hidden="true"
                  />
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-red-200">
                      Generation failed
                    </p>
                    <p className="text-xs leading-relaxed text-red-300/90">
                      {apiError}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => runGeneration(activeRefinement ?? undefined)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-100 hover:bg-red-500/25 transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApiError(null)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-300 hover:text-white transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {isLoading && !currentPackage && <OutputSkeleton />}

            {!isLoading && !currentPackage && (
              <div className="flex min-h-[500px] flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#11141B] px-6 py-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-[#161A23]">
                  <Film className="h-5 w-5 text-[#FB7185]" aria-hidden="true" />
                </div>
                <h2 className="font-display text-xl font-semibold text-white">
                  Your production package appears here
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                  Enter a video idea or click one of the three preset topics on the left, then hit Generate Package.
                </p>

                <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-4 border-t border-white/[0.07] pt-6 text-left sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold text-white">
                      5 Opening Hooks
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Curiosity, myth-busting, contrarian, value, and relatable lines under 12 words.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Time-Blocked Script
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Paced spoken narration and camera cues mapped to your exact duration.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Thumbnail & Prompts
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      2–4 word cover text, visual scene concept, 3 titles, and copy-ready Canva or Bing prompts.
                    </p>
                  </div>
                </div>

                {history.length > 0 && (
                  <div className="mt-7">
                    <button
                      type="button"
                      onClick={() => handleLoadDraft(history[0])}
                      className="rounded-lg border border-white/[0.12] bg-[#161A23] px-4 py-2 text-xs font-medium text-slate-200 hover:border-white/[0.24] hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E]"
                    >
                      Load Latest Saved Draft
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentPackage && (
              <div
                className={`space-y-8 transition-opacity duration-150 ${
                  isLoading ? 'opacity-60 pointer-events-none' : 'opacity-100'
                }`}
              >
                <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 space-y-1">
                    <h2 className="font-display text-xl font-semibold tracking-tight text-white text-balance">
                      {currentPackage.topic}
                    </h2>
                    <p className="text-xs text-slate-400 tabular-nums">
                      <span>{currentPackage.platform}</span>
                      <span aria-hidden="true" className="mx-1.5 text-slate-600">
                        ·
                      </span>
                      <span>{currentPackage.duration}s</span>
                      <span aria-hidden="true" className="mx-1.5 text-slate-600">
                        ·
                      </span>
                      <span>{currentPackage.language}</span>
                      <span aria-hidden="true" className="mx-1.5 text-slate-600">
                        ·
                      </span>
                      <span>{currentPackage.tone}</span>
                      {currentPackage.refinementNote && (
                        <>
                          <span aria-hidden="true" className="mx-1.5 text-slate-600">
                            ·
                          </span>
                          <span className="text-[#FB7185]">
                            {currentPackage.refinementNote}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <RefinementBar
                    activeRefinement={activeRefinement}
                    isLoading={isLoading}
                    onRefine={(mode) => runGeneration(mode)}
                  />
                </div>

                <HooksSection hooks={currentPackage.hooks} />
                <ScriptSection pkg={currentPackage} />
                <ThumbnailSection
                  synergy={currentPackage.thumbnailSynergy}
                  topic={currentPackage.topic}
                  platform={currentPackage.platform}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      <HistoryPanel
        isOpen={isHistoryOpen}
        items={history}
        activeDraftId={currentPackage?.id}
        onClose={() => setIsHistoryOpen(false)}
        onSelectDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
        onClearAll={handleClearHistory}
      />
    </div>
  );
}

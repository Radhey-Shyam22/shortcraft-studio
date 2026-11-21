import { Loader2, ArrowRight } from 'lucide-react';
import {
  DURATIONS,
  LANGUAGES,
  PLATFORMS,
  TONES,
  TOPIC_PRESETS,
  type DurationSeconds,
  type LanguageStyle,
  type Platform,
  type ToneOption,
  type TopicPreset,
} from '../lib/shortcraft';

interface GeneratorFormProps {
  topic: string;
  platform: Platform;
  duration: DurationSeconds;
  language: LanguageStyle;
  tone: ToneOption;
  isLoading: boolean;
  validationError: string | null;
  onTopicChange: (value: string) => void;
  onPlatformChange: (value: Platform) => void;
  onDurationChange: (value: DurationSeconds) => void;
  onLanguageChange: (value: LanguageStyle) => void;
  onToneChange: (value: ToneOption) => void;
  onSelectPreset: (preset: TopicPreset) => void;
  onSubmit: () => void;
}

export function GeneratorForm({
  topic,
  platform,
  duration,
  language,
  tone,
  isLoading,
  validationError,
  onTopicChange,
  onPlatformChange,
  onDurationChange,
  onLanguageChange,
  onToneChange,
  onSelectPreset,
  onSubmit,
}: GeneratorFormProps) {
  return (
    <section
      id="studio-inputs"
      aria-labelledby="brief-heading"
      className="rounded-xl border border-white/[0.08] bg-[#11141B] p-4 sm:p-5"
    >
      <div className="mb-3.5">
        <h2
          id="brief-heading"
          className="font-display text-base font-semibold tracking-tight text-white"
        >
          Creative Brief
        </h2>
        <p className="mt-0.5 text-xs text-slate-400 tracking-[0.01em]">
          Define your topic, platform, pacing, and voice.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        noValidate
        className="space-y-4"
      >
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <label
              htmlFor="topic-input"
              className="text-xs font-medium text-slate-200"
            >
              Topic or Video Idea
            </label>
            <span className="font-mono text-xs tabular-nums text-slate-500">
              {topic.length}/280
            </span>
          </div>
          <textarea
            id="topic-input"
            rows={2}
            maxLength={280}
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            placeholder="e.g., Why 90% of cold DMs fail and the 2-line fix that gets replies"
            aria-invalid={Boolean(validationError)}
            aria-describedby={validationError ? 'topic-error' : undefined}
            className={`w-full resize-none rounded-lg border bg-[#090B0F] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F43F5E]/70 transition-colors duration-150 ${
              validationError
                ? 'border-red-500/70'
                : 'border-white/[0.1] hover:border-white/[0.18]'
            }`}
          />
          {validationError && (
            <p
              id="topic-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-400"
            >
              {validationError}
            </p>
          )}

          <div className="mt-2.5">
            <p className="mb-1.5 text-xs text-slate-400">Quick sample topics</p>
            <div className="flex flex-wrap gap-1.5">
              {TOPIC_PRESETS.map((preset) => {
                const isSelected = topic.trim() === preset.topic;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onSelectPreset(preset)}
                    disabled={isLoading}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] disabled:opacity-50 ${
                      isSelected
                        ? 'border-[#F43F5E]/60 bg-[#F43F5E]/12 text-white'
                        : 'border-white/[0.08] bg-[#161A23] text-slate-300 hover:border-white/[0.18] hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <span
            id="platform-label"
            className="mb-1.5 block text-xs font-medium text-slate-200"
          >
            Platform
          </span>
          <div
            role="radiogroup"
            aria-labelledby="platform-label"
            className="flex flex-wrap gap-1 rounded-lg border border-white/[0.08] bg-[#090B0F] p-1"
          >
            {PLATFORMS.map((item) => {
              const active = platform === item;
              return (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onPlatformChange(item)}
                  disabled={isLoading}
                  className={`flex-auto rounded-md px-2.5 py-1.5 text-center text-xs font-medium transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] disabled:opacity-50 ${
                    active
                      ? 'bg-[#161A23] text-white border border-white/[0.14]'
                      : 'border border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div>
            <span
              id="duration-label"
              className="mb-1.5 block text-xs font-medium text-slate-200"
            >
              Target Duration
            </span>
            <div
              role="radiogroup"
              aria-labelledby="duration-label"
              className="grid grid-cols-4 gap-1 rounded-lg border border-white/[0.08] bg-[#090B0F] p-1"
            >
              {DURATIONS.map((sec) => {
                const active = duration === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onDurationChange(sec)}
                    disabled={isLoading}
                    className={`rounded-md py-1.5 font-mono text-xs font-medium tabular-nums transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] disabled:opacity-50 ${
                      active
                        ? 'bg-[#161A23] text-white border border-white/[0.14]'
                        : 'border border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sec}s
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span
              id="language-label"
              className="mb-1.5 block text-xs font-medium text-slate-200"
            >
              Language / Style
            </span>
            <div
              role="radiogroup"
              aria-labelledby="language-label"
              className="grid grid-cols-3 gap-1 rounded-lg border border-white/[0.08] bg-[#090B0F] p-1"
            >
              {LANGUAGES.map((lang) => {
                const active = language === lang;
                return (
                  <button
                    key={lang}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onLanguageChange(lang)}
                    disabled={isLoading}
                    className={`rounded-md py-1.5 text-xs font-medium transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] disabled:opacity-50 ${
                      active
                        ? 'bg-[#161A23] text-white border border-white/[0.14]'
                        : 'border border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <span
            id="tone-label"
            className="mb-1.5 block text-xs font-medium text-slate-200"
          >
            Tone
          </span>
          <div
            role="radiogroup"
            aria-labelledby="tone-label"
            className="grid grid-cols-2 gap-1.5"
          >
            {TONES.map((item) => {
              const active = tone === item;
              return (
                <button
                  key={item}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onToneChange(item)}
                  disabled={isLoading}
                  className={`rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-colors duration-150 whitespace-nowrap truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] disabled:opacity-50 ${
                    active
                      ? 'border-[#F43F5E]/60 bg-[#F43F5E]/12 text-white'
                      : 'border-white/[0.08] bg-[#090B0F] text-slate-300 hover:border-white/[0.18] hover:text-white'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#F43F5E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#E11D48] active:bg-[#BE123C] transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F43F5E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11141B] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Generating Package...</span>
            </>
          ) : (
            <>
              <span>Generate Package</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>
    </section>
  );
}

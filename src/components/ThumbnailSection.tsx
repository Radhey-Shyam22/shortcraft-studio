import { CopyButton } from './CopyButton';
import {
  getResolvedThumbnailPrompts,
  type Platform,
  type ThumbnailTitleSynergy,
} from '../lib/shortcraft';

interface ThumbnailSectionProps {
  synergy: ThumbnailTitleSynergy;
  topic?: string;
  platform?: Platform;
}

export function ThumbnailSection({
  synergy,
  topic,
  platform,
}: ThumbnailSectionProps) {
  const prompts = getResolvedThumbnailPrompts(synergy, { topic, platform });

  return (
    <section
      id="section-thumbnail"
      aria-labelledby="thumbnail-heading"
      className="space-y-4"
    >
      <div>
        <h3
          id="thumbnail-heading"
          className="font-display text-xl font-semibold tracking-tight text-white"
        >
          03. Thumbnail & Title Synergy
        </h3>
        <p className="mt-0.5 text-xs text-slate-400 tracking-[0.01em]">
          Pair a 2–4 word visual hook with matching title variants and ready-to-copy prompts for Canva or Bing Image Creator.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#11141B] p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-300">
                Thumbnail Text
              </span>
              <CopyButton
                text={synergy.thumbnailText}
                label="Copy"
                ariaLabel="Copy thumbnail text"
              />
            </div>

            <div className="relative flex aspect-[9/12] w-full flex-col justify-end overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-to-b from-[#1A202C] via-[#11151E] to-[#090B0F] p-4">
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="relative z-10 space-y-1.5">
                <p className="font-display text-2xl font-bold uppercase leading-[1.05] tracking-tight text-white text-balance">
                  {synergy.thumbnailText}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.07] pt-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-300">
                Detailed Visual Concept
              </span>
              <CopyButton
                text={synergy.visualConcept}
                label="Copy"
                ariaLabel="Copy visual scene concept"
              />
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              {synergy.visualConcept}
            </p>
          </div>
        </div>

        <div className="space-y-4 min-w-0">
          <div className="rounded-xl border border-white/[0.08] bg-[#11141B] p-4 sm:p-5">
            <div>
              <h4 className="text-sm font-semibold text-white">
                Title Variants
              </h4>
              <p className="mt-0.5 text-xs text-slate-400">
                Three angles synced to your thumbnail promise.
              </p>
            </div>

            <div className="mt-3 divide-y divide-white/[0.07]">
              {synergy.titleVariants.map((title, idx) => (
                <div
                  key={`${idx}-${title.slice(0, 16)}`}
                  className="flex flex-col gap-2.5 py-3 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-mono text-xs text-slate-500 tabular-nums">
                      Option 0{idx + 1}
                    </span>
                    <p className="text-sm font-medium leading-snug text-slate-100">
                      {title}
                    </p>
                  </div>
                  <CopyButton
                    text={title}
                    label="Copy"
                    ariaLabel={`Copy title option ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#11141B] p-4 sm:p-5">
            <div>
              <h4 className="text-sm font-semibold text-white">
                Image Generator Prompts
              </h4>
              <p className="mt-0.5 text-xs text-slate-400">
                Ready-to-paste prompts built from your script, visual cues, and title hook.
              </p>
            </div>

            <div className="mt-3 divide-y divide-white/[0.07]">
              <div className="py-3.5 first:pt-1 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-200">
                      Canva / Clean Backdrop Prompt
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      9:16 Vertical · No Embedded Text
                    </p>
                  </div>
                  <CopyButton
                    text={prompts.canvaCleanPrompt}
                    label="Copy Prompt"
                    copiedLabel="Prompt Copied"
                    ariaLabel="Copy Canva clean backdrop prompt"
                  />
                </div>
                <p className="text-xs leading-relaxed text-slate-300 bg-[#090B0F] rounded-lg px-3.5 py-3">
                  {prompts.canvaCleanPrompt}
                </p>
              </div>

              <div className="py-3.5 last:pb-1 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-200">
                      Bing Image Creator / With Text Prompt
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                      9:16 Vertical · Matches &ldquo;{synergy.thumbnailText}&rdquo;
                    </p>
                  </div>
                  <CopyButton
                    text={prompts.bingTextPrompt}
                    label="Copy Prompt"
                    copiedLabel="Prompt Copied"
                    ariaLabel="Copy Bing Image Creator prompt"
                  />
                </div>
                <p className="text-xs leading-relaxed text-slate-300 bg-[#090B0F] rounded-lg px-3.5 py-3">
                  {prompts.bingTextPrompt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

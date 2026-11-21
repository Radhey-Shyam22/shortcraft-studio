import { CopyButton } from './CopyButton';
import type { HookItem } from '../lib/shortcraft';

interface HooksSectionProps {
  hooks: readonly HookItem[];
}

export function HooksSection({ hooks }: HooksSectionProps) {
  return (
    <section
      id="section-hooks"
      aria-labelledby="hooks-heading"
      className="space-y-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3
            id="hooks-heading"
            className="font-display text-xl font-semibold tracking-tight text-white"
          >
            01. Opening Hooks (First 3 Seconds)
          </h3>
          <p className="mt-0.5 text-xs text-slate-400 tracking-[0.01em]">
            Five distinct retention angles under 12 words each. Pick one to open the camera roll.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {hooks.map((hook, index) => (
          <article
            key={`${hook.angle}-${index}`}
            className={`flex flex-col justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#11141B] p-4 transition-colors duration-150 hover:border-white/[0.14] ${
              hooks.length === 5 && index === 4 ? 'md:col-span-2' : ''
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                <span className="font-medium text-slate-300">{hook.angle}</span>
                <span className="font-mono tabular-nums text-slate-500">
                  {hook.wordCount} words
                </span>
              </div>
              <p className="text-[15px] font-medium leading-snug text-white tracking-[0.01em]">
                {hook.text}
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <CopyButton
                text={hook.text}
                label="Copy"
                ariaLabel={`Copy ${hook.angle} hook`}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

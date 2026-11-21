import { CopyButton } from './CopyButton';
import { formatFullScriptForCopy, type ShortPackage } from '../lib/shortcraft';

interface ScriptSectionProps {
  pkg: ShortPackage;
}

export function ScriptSection({ pkg }: ScriptSectionProps) {
  const fullScriptText = formatFullScriptForCopy(pkg);

  return (
    <section
      id="section-script"
      aria-labelledby="script-heading"
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3
            id="script-heading"
            className="font-display text-xl font-semibold tracking-tight text-white"
          >
            02. Time-Blocked Script
          </h3>
          <p className="mt-0.5 text-xs text-slate-400 tabular-nums tracking-[0.01em]">
            <span>{pkg.totalWordCount} estimated spoken words</span>
            <span aria-hidden="true" className="mx-1.5 text-slate-600">
              ·
            </span>
            <span>{pkg.duration}s target pacing</span>
            <span aria-hidden="true" className="mx-1.5 text-slate-600">
              ·
            </span>
            <span>{pkg.language}</span>
          </p>
        </div>

        <CopyButton
          text={fullScriptText}
          label="Copy Full Script"
          copiedLabel="Full Script Copied"
          ariaLabel="Copy full time-blocked script"
        />
      </div>

      <div className="divide-y divide-white/[0.07] rounded-xl border border-white/[0.08] bg-[#11141B]">
        {pkg.script.map((segment) => (
          <div
            key={segment.stage}
            className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-5 sm:p-5"
          >
            <div className="space-y-1">
              <div className="font-mono text-xs font-medium tabular-nums text-[#FB7185]">
                {segment.timeRange}
              </div>
              <div className="text-sm font-semibold text-white">
                {segment.stage}
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-[15px] leading-relaxed text-slate-100 tracking-[0.01em]">
                {segment.spokenNarration}
              </p>
              <p className="text-xs leading-relaxed text-slate-400">
                <span className="font-medium text-slate-300">Visual cue: </span>
                {segment.visualCue}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

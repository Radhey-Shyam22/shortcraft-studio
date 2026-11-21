export function OutputSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Generating short-form package"
      className="space-y-8 animate-pulse"
    >
      <div className="space-y-3">
        <div className="h-6 w-64 rounded-md bg-white/[0.06]" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 rounded-xl border border-white/[0.06] bg-[#11141B] p-4 space-y-3"
            >
              <div className="flex justify-between">
                <div className="h-3 w-24 rounded bg-white/[0.06]" />
                <div className="h-3 w-12 rounded bg-white/[0.05]" />
              </div>
              <div className="h-4 w-5/6 rounded bg-white/[0.08]" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="h-6 w-52 rounded-md bg-white/[0.06]" />
        <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-[#11141B]">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="p-5 space-y-2.5">
              <div className="h-3.5 w-32 rounded bg-white/[0.06]" />
              <div className="h-4 w-full rounded bg-white/[0.08]" />
              <div className="h-3 w-4/5 rounded bg-white/[0.05]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

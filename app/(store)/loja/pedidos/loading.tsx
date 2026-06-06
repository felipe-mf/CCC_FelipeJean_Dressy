export default function StoreOrdersLoading() {
  return (
    <div className="flex flex-col gap-6 py-6 animate-pulse">
      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-9 w-32 rounded-xl bg-muted" />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-6 w-24 rounded-full bg-muted" />
            </div>
            <div className="flex items-center gap-3 px-6 py-4">
              <div className="size-12 rounded-lg bg-muted" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-3 w-1/4 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

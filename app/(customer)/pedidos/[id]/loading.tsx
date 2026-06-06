export default function OrderDetailLoading() {
  return (
    <div className="px-6 md:px-12 lg:px-20 py-10 md:py-14 max-w-4xl animate-pulse">
      <div className="h-3 w-48 rounded bg-muted mb-10" />

      <header className="flex flex-col gap-3 mb-10">
        <div className="h-9 w-56 rounded bg-muted" />
        <div className="h-4 w-40 rounded bg-muted" />
      </header>

      <div className="rounded-2xl border border-border bg-card divide-y divide-border">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-5">
            <div className="size-16 shrink-0 rounded-lg bg-muted" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-3 w-1/4 rounded bg-muted" />
            </div>
            <div className="h-5 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
      </div>
    </div>
  );
}

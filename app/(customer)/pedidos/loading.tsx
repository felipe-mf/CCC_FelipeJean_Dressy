export default function OrdersLoading() {
  return (
    <div className="px-6 md:px-12 lg:px-20 py-16 md:py-20 animate-pulse">
      <header className="flex flex-col gap-3 max-w-2xl mb-12">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-10 w-64 rounded bg-muted" />
      </header>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-lg bg-muted" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            </div>
            <div className="h-6 w-24 rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

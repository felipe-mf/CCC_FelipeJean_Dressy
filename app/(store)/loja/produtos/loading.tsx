export default function ProductsLoading() {
  return (
    <section className="flex flex-col gap-10 py-6 animate-pulse">
      <header className="flex flex-col gap-4">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-12 w-72 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </header>

      <div className="flex items-center justify-between">
        <div className="h-10 flex-1 max-w-md rounded bg-muted" />
        <div className="h-4 w-16 rounded bg-muted" />
      </div>

      <div className="bg-card border border-border rounded-2xl divide-y divide-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-6 py-3">
            <div className="size-12 shrink-0 rounded-lg bg-muted" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 w-1/3 rounded bg-muted" />
              <div className="h-3 w-1/5 rounded bg-muted" />
            </div>
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}

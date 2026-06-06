export default function CartLoading() {
  return (
    <div className="px-6 md:px-12 lg:px-20 py-16 md:py-20 animate-pulse">
      <header className="flex flex-col gap-3 max-w-2xl mb-12">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-10 w-64 rounded bg-muted" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <section className="lg:col-span-8 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="size-20 shrink-0 rounded-xl bg-muted" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-3 w-1/4 rounded bg-muted" />
              </div>
              <div className="h-6 w-20 rounded bg-muted" />
            </div>
          ))}
        </section>

        <aside className="lg:col-span-4">
          <div className="flex flex-col gap-4 rounded-2xl bg-surface border border-border p-6">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-12 w-full rounded-xl bg-muted mt-2" />
          </div>
        </aside>
      </div>
    </div>
  );
}

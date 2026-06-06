export function ProductFormSkeleton() {
  return (
    <section className="flex flex-col gap-10 py-6 animate-pulse">
      <header className="flex flex-col gap-3">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-10 w-64 rounded bg-muted" />
      </header>

      <div className="flex flex-col gap-8">
        <div className="h-12 w-full rounded bg-muted" />
        <div className="h-28 w-full rounded bg-muted" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-12 w-full rounded bg-muted" />
          <div className="h-12 w-full rounded bg-muted" />
        </div>
        <div className="h-12 w-full rounded bg-muted" />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-muted" />
          ))}
        </div>

        <div className="h-14 w-full rounded-xl bg-muted" />
      </div>
    </section>
  );
}

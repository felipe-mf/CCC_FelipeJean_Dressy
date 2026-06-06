export default function ReviewsLoading() {
  return (
    <section className="flex flex-col gap-10 py-6 animate-pulse">
      <header className="flex flex-col gap-3 max-w-2xl">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-12 w-80 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </header>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4 h-40 rounded-2xl bg-muted" />
        <div className="col-span-12 md:col-span-8 h-40 rounded-2xl bg-muted" />
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 w-full rounded-2xl bg-muted" />
        ))}
      </div>
    </section>
  );
}

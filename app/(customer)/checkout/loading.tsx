export default function CheckoutLoading() {
  return (
    <div className="px-6 md:px-12 lg:px-20 py-16 md:py-20 animate-pulse">
      <header className="flex flex-col gap-3 max-w-2xl mb-12">
        <div className="h-3 w-24 rounded bg-muted" />
        <div className="h-10 w-56 rounded bg-muted" />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="h-3 w-40 rounded bg-muted" />
          <div className="h-24 w-full rounded-2xl bg-muted" />
          <div className="h-24 w-full rounded-2xl bg-muted" />
          <div className="h-14 w-full rounded-xl bg-muted mt-2" />
        </section>

        <aside className="lg:col-span-5">
          <div className="flex flex-col gap-4 rounded-2xl bg-surface border border-border p-6">
            <div className="h-3 w-24 rounded bg-muted" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-muted" />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

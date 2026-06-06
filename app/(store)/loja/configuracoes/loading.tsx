export default function StoreSettingsLoading() {
  return (
    <section className="max-w-xl w-full mx-auto flex flex-col gap-10 py-6 animate-pulse">
      <header className="flex flex-col gap-3">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="h-10 w-72 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
      </header>

      <div className="flex flex-col gap-8">
        <div className="h-12 w-full rounded bg-muted" />
        <div className="h-28 w-full rounded bg-muted" />
        <div className="h-12 w-full rounded bg-muted" />
        <div className="h-12 w-full rounded bg-muted" />
        <div className="h-14 w-full rounded-xl bg-muted" />
      </div>
    </section>
  );
}

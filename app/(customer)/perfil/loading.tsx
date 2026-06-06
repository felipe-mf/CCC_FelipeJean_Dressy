export default function ProfileLoading() {
  return (
    <div className="px-6 md:px-12 lg:px-20 py-16 md:py-20 max-w-3xl animate-pulse">
      <header className="flex items-end justify-between gap-4 mb-12">
        <div className="flex flex-col gap-3">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-10 w-48 rounded bg-muted" />
        </div>
        <div className="h-4 w-16 rounded bg-muted" />
      </header>

      <div className="flex flex-col gap-8">
        <div className="h-12 w-full rounded bg-muted" />
        <div className="h-12 w-full rounded bg-muted" />
        <div className="h-12 w-44 rounded-xl bg-muted" />
      </div>

      <div className="mt-16 flex flex-col gap-4">
        <div className="h-3 w-32 rounded bg-muted" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-24 w-full rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

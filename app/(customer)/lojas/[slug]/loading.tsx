export default function StoreLoading() {
  return (
    <div className="px-6 md:px-12 lg:px-20 py-10 md:py-14 animate-pulse">
      <div className="h-3 w-48 rounded bg-muted mb-8" />

      <div className="aspect-[16/6] md:aspect-[5/1.4] w-full rounded-2xl bg-muted" />

      <div className="relative -mt-12 md:-mt-16 px-1 md:px-6 flex flex-col md:flex-row md:items-end gap-5 md:gap-7">
        <div className="size-24 md:size-32 shrink-0 rounded-2xl border-4 border-background bg-muted" />
        <div className="flex flex-col gap-3 md:pb-2">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-10 w-56 rounded bg-muted" />
        </div>
      </div>

      <div className="h-4 w-2/3 max-w-2xl rounded bg-muted mt-8" />
      <div className="h-px w-full bg-border mt-10 mb-10" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[3/4] rounded-2xl bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

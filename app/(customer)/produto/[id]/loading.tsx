export default function ProductLoading() {
  return (
    <div className="px-6 md:px-12 lg:px-20 py-10 md:py-14 animate-pulse">
      <div className="h-3 w-48 rounded bg-muted mb-10" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="flex flex-col gap-4">
          <div className="aspect-[3/4] rounded-2xl bg-muted" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:pt-6">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-10 w-3/4 rounded bg-muted" />
          <div className="h-8 w-32 rounded bg-muted" />
          <div className="flex flex-col gap-2 pt-4">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
          <div className="h-14 w-full rounded-xl bg-muted mt-4" />
        </div>
      </div>
    </div>
  );
}

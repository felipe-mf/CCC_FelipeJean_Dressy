export default function MarketplaceLoading() {
  return (
    <div className="px-6 md:px-12 lg:px-20 py-16 md:py-20 animate-pulse">
      <header className="flex flex-col gap-4 max-w-3xl mb-14 md:mb-20">
        <div className="h-3 w-32 rounded bg-muted" />
        <div className="h-12 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </header>

      <div className="flex items-center gap-3 mb-10">
        <div className="h-8 w-28 rounded-xl bg-muted" />
        <div className="h-8 w-28 rounded-xl bg-muted" />
        <div className="h-8 w-28 rounded-xl bg-muted" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[3/4] rounded-2xl bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

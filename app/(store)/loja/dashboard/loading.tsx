export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-10 animate-pulse">
      <div className="flex items-start gap-6">
        <div className="size-20 rounded-2xl bg-muted" />
        <div className="flex flex-col gap-3 pt-2">
          <div className="h-2.5 w-16 rounded bg-muted" />
          <div className="h-8 w-52 rounded bg-muted" />
          <div className="h-5 w-32 rounded bg-muted" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-muted" />
        <div className="h-2.5 w-24 rounded bg-muted" />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-5 h-40 rounded-2xl bg-muted" />
        <div className="col-span-6 md:col-span-3 h-40 rounded-2xl bg-muted" />
        <div className="col-span-6 md:col-span-2 h-40 rounded-2xl bg-muted" />
        <div className="col-span-12 md:col-span-2 h-40 rounded-2xl bg-muted" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-7 h-72 rounded-2xl bg-muted" />
        <div className="col-span-12 md:col-span-5 h-72 rounded-2xl bg-muted" />
      </div>
    </div>
  );
}

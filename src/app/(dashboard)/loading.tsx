export default function DashboardLoading() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-pulse pb-12">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-80 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded-md" />
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-36 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
                </div>
              </div>
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-64 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs space-y-4">
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
            <div className="h-32 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}


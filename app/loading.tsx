// Shown inside the real header and footer while a route loads.
export default function Loading() {
  return (
    <div className="site-container px-4 py-10 md:px-6 lg:py-12" aria-busy="true" aria-label="Loading">
      <div className="max-w-3xl space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-fill" />
        <div className="h-9 w-3/4 animate-pulse rounded bg-fill" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-fill" />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-16/10 animate-pulse rounded-card bg-fill" />
            <div className="mt-3 h-3 w-20 animate-pulse rounded bg-fill" />
            <div className="mt-2 h-5 w-full animate-pulse rounded bg-fill" />
            <div className="mt-1.5 h-5 w-2/3 animate-pulse rounded bg-fill" />
          </div>
        ))}
      </div>
    </div>
  );
}

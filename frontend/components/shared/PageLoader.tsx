
export function PageLoader() {
  return (
    <div className="flex flex-col gap-6 p-6 animate-pulse">
  
      <div className="h-8 w-48 rounded-md bg-muted" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-10 w-full rounded-md bg-muted" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 w-full rounded-md bg-muted opacity-70" />
        ))}
      </div>
    </div>
  );
}

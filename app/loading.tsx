export default function Loading() {
  return (
    <main className="min-h-[70vh] bg-bg" aria-label="Loading page" aria-busy="true">
      <div className="route-progress" aria-hidden="true" />
      <div className="mx-auto max-w-wide px-4 py-10 lg:px-8">
        <div className="h-3 w-24 animate-pulse bg-bg-elevated" />
        <div className="mt-4 h-12 w-full max-w-xl animate-pulse bg-bg-elevated" />
        <div className="mt-4 h-5 w-full max-w-2xl animate-pulse bg-bg-elevated" />
        <div className="mt-10 grid gap-8 border-t border-border pt-8 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]">
          <div className="space-y-4">
            <div className="h-7 w-4/5 animate-pulse bg-bg-elevated" />
            <div className="h-4 w-full animate-pulse bg-bg-elevated" />
            <div className="h-4 w-3/4 animate-pulse bg-bg-elevated" />
          </div>
          <div className="aspect-[16/10] animate-pulse bg-bg-elevated" />
        </div>
      </div>
    </main>
  );
}

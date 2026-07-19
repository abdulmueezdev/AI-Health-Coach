export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 bg-[var(--bg-panel-accent)]/20 rounded-lg animate-pulse" />
      <div className="h-4 w-96 bg-[var(--bg-panel-accent)]/20 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 bg-[var(--bg-panel-accent)]/20 rounded-2xl animate-pulse" />
        <div className="h-32 bg-[var(--bg-panel-accent)]/20 rounded-2xl animate-pulse" />
        <div className="h-32 bg-[var(--bg-panel-accent)]/20 rounded-2xl animate-pulse" />
      </div>
    </div>
  )
}

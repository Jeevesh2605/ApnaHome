export default function Loader() {
  return (
    <div className="fixed inset-0 bg-cream flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-border border-t-amber rounded-full animate-spin" />
        <span className="font-serif text-brown-muted text-sm">Loading…</span>
      </div>
    </div>
  )
}

export default function Carregando() {
  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <div className="animate-pulse">
        <div className="h-3 w-32 rounded bg-white/10 mb-3" />
        <div className="h-9 w-64 rounded bg-white/10 mb-8" />

        <div className="h-24 rounded-2xl bg-surface border border-border mb-6" />

        <div className="grid grid-cols-3 gap-2.5 md:gap-4 mb-6 items-end">
          <div className="h-[150px] rounded-2xl bg-surface border border-border" />
          <div className="h-[190px] rounded-2xl bg-surface border border-border" />
          <div className="h-[150px] rounded-2xl bg-surface border border-border" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="h-14 rounded-2xl bg-surface border border-border" />
          <div className="h-14 rounded-2xl bg-surface border border-border" />
          <div className="h-14 rounded-2xl bg-surface border border-border" />
        </div>
      </div>
    </main>
  )
}

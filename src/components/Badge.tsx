export function BadgeTipo({ tipo }: { tipo: string | null }) {
  if (tipo === 'fixo') {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
        Fixo
      </span>
    )
  }
  if (tipo === 'convidado') {
    return (
      <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-medium text-sky-400">
        Convidado
      </span>
    )
  }
  return null
}

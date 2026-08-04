'use client'

import Link from 'next/link'
import { Flag, ClipboardList, Users, Pencil } from 'lucide-react'

type Etapa = {
  id: string
  nome: string | null
  pista: string
  data: string
  status: string
  observacoes?: string | null
}

const statusCor: Record<string, string> = {
  agendada: 'text-sky-400 bg-sky-500/15',
  realizada: 'text-emerald-400 bg-emerald-500/15',
  cancelada: 'text-white/50 bg-white/10',
}

function formatarData(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split('T')[0].split('-').map(Number)
  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR')
}

const botao =
  'flex items-center justify-center text-white/60 hover:text-accent border border-border rounded-lg p-2 transition-colors shrink-0'

export function LinhaEtapa({
  etapa,
  onEditar,
}: {
  etapa: Etapa
  onEditar: (etapa: Etapa) => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2.5">
      <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
        <Flag className="text-accent" size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">
          {etapa.nome ?? 'Etapa'}
          <span
            className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${
              statusCor[etapa.status] ?? statusCor.agendada
            }`}
          >
            {etapa.status}
          </span>
        </p>
        <p className="text-white/40 text-xs truncate">
          {etapa.pista} · {formatarData(etapa.data)}
        </p>
      </div>

      <button onClick={() => onEditar(etapa)} className={botao} title="Editar etapa">
        <Pencil size={16} />
      </button>

      <Link href={`/admin/etapas/${etapa.id}/pilotos`} className={botao} title="Associar pilotos">
        <Users size={16} />
      </Link>

      <Link href={`/admin/resultados/${etapa.id}`} className={botao} title="Lançar resultado">
        <ClipboardList size={16} />
      </Link>
    </div>
  )
}

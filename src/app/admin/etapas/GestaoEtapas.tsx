'use client'

import { useMemo, useState } from 'react'
import { FormEtapa } from './FormEtapa'
import { LinhaEtapa } from './LinhaEtapa'
import { Plus, Search, X } from 'lucide-react'

type Etapa = {
  id: string
  nome: string | null
  pista: string
  data: string
  horario?: string | null
  status: string
  observacoes?: string | null
}

type Props = {
  etapas: Etapa[]
  salvarEtapa: (formData: FormData) => Promise<void>
}

export function GestaoEtapas({ etapas, salvarEtapa }: Props) {
  const [painel, setPainel] = useState<'fechado' | 'nova' | 'editando'>('fechado')
  const [editando, setEditando] = useState<Etapa | null>(null)
  const [busca, setBusca] = useState('')

  const filtradas = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return etapas
    return etapas.filter(
      (e) =>
        (e.nome ?? '').toLowerCase().includes(t) ||
        e.pista.toLowerCase().includes(t) ||
        e.status.toLowerCase().includes(t)
    )
  }, [etapas, busca])

  const realizadas = etapas.filter((e) => e.status === 'realizada').length
  const agendadas = etapas.filter((e) => e.status === 'agendada').length

  function abrirNova() {
    setEditando(null)
    setPainel('nova')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function abrirEdicao(etapa: Etapa) {
    setEditando(etapa)
    setPainel('editando')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function fechar() {
    setPainel('fechado')
    setEditando(null)
  }

  return (
    <div className="flex flex-col gap-5">
      {painel !== 'fechado' && (
        <section className="bg-surface border border-accent/30 rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display uppercase text-sm tracking-wide text-white/50">
              {painel === 'editando' ? `Editando: ${editando?.nome ?? editando?.pista}` : 'Nova etapa'}
            </h2>
            <button
              onClick={fechar}
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs transition-colors"
            >
              <X size={14} /> Fechar
            </button>
          </div>
          <div className="max-w-xl">
            <FormEtapa
              salvarEtapa={salvarEtapa}
              etapaEditando={editando}
              onSalvo={fechar}
              onCancelar={fechar}
            />
          </div>
        </section>
      )}

      <section className="bg-surface border border-border rounded-2xl p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display uppercase text-sm tracking-wide text-white/50">
              Etapas cadastradas
            </h2>
            <p className="text-white/30 text-xs mt-0.5">
              {etapas.length} no total · {realizadas} realizadas · {agendadas} agendadas
            </p>
          </div>
          {painel === 'fechado' && (
            <button
              onClick={abrirNova}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl px-4 py-2.5 text-sm transition-colors"
            >
              <Plus size={16} /> Nova etapa
            </button>
          )}
        </div>

        {etapas.length > 4 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, pista ou status"
              className="w-full bg-bg border border-border rounded-xl pl-9 pr-3 py-2.5 text-white text-sm outline-none focus:border-accent transition-colors"
            />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
          {filtradas.map((e) => (
            <LinhaEtapa key={e.id} etapa={e} onEditar={abrirEdicao} />
          ))}
        </div>

        {filtradas.length === 0 && (
          <p className="text-white/40 text-sm py-4">
            {busca ? 'Nenhuma etapa encontrada para essa busca.' : 'Nenhuma etapa ainda.'}
          </p>
        )}
      </section>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { FormEtapa } from './FormEtapa'
import { LinhaEtapa } from './LinhaEtapa'

type Etapa = {
  id: string
  nome: string | null
  pista: string
  data: string
  status: string
  observacoes?: string | null
}

type Props = {
  etapas: Etapa[]
  salvarEtapa: (formData: FormData) => Promise<void>
}

export function GestaoEtapas({ etapas, salvarEtapa }: Props) {
  const [editando, setEditando] = useState<Etapa | null>(null)

  function editar(etapa: Etapa) {
    setEditando(etapa)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50">
            {editando ? `Editando: ${editando.nome ?? 'Etapa'}` : 'Nova etapa'}
          </h2>
        </div>
        <FormEtapa
          salvarEtapa={salvarEtapa}
          etapaEditando={editando}
          onSalvo={() => setEditando(null)}
          onCancelar={() => setEditando(null)}
        />
      </section>

      <section className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-4">
          Etapas cadastradas ({etapas.length})
        </h2>
        <div className="flex flex-col gap-2">
          {etapas.map((e) => (
            <LinhaEtapa key={e.id} etapa={e} onEditar={editar} />
          ))}
          {etapas.length === 0 && (
            <p className="text-white/40 text-sm">Nenhuma etapa ainda.</p>
          )}
        </div>
      </section>
    </div>
  )
}

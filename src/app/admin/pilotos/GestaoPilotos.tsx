'use client'

import { useState } from 'react'
import { FormPiloto } from './FormPiloto'
import { LinhaPiloto } from './LinhaPiloto'

type Piloto = {
  id: string
  nome: string
  numero_kart: number | null
  idade: number | null
  cidade: string | null
  telefone: string | null
  categoria: string | null
  estilo_pilotagem: string | null
  caracteristicas: string | null
  ativo: boolean
  peso?: number | null
  tipo?: string | null
}

type Props = {
  pilotos: Piloto[]
  salvarPiloto: (formData: FormData) => Promise<void>
  alternarAtivo: (id: string, ativo: boolean) => Promise<void>
}

export function GestaoPilotos({ pilotos, salvarPiloto, alternarAtivo }: Props) {
  const [editando, setEditando] = useState<Piloto | null>(null)

  function editar(id: string) {
    const p = pilotos.find((x) => x.id === id)
    if (p) {
      setEditando(p)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50">
            {editando ? `Editando: ${editando.nome}` : 'Novo piloto'}
          </h2>
          {editando && (
            <button
              onClick={() => setEditando(null)}
              className="text-white/50 hover:text-white text-xs"
            >
              Cancelar edição
            </button>
          )}
        </div>
        <FormPiloto
          salvarPiloto={salvarPiloto}
          pilotoEditando={editando}
          onSalvo={() => setEditando(null)}
        />
      </section>

      <section className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-4">
          Pilotos cadastrados ({pilotos.length})
        </h2>
        <div className="flex flex-col gap-2">
          {pilotos.map((p) => (
            <LinhaPiloto
              key={p.id}
              piloto={p}
              alternarAtivo={alternarAtivo}
              onEditar={editar}
            />
          ))}
          {pilotos.length === 0 && (
            <p className="text-white/40 text-sm">Nenhum piloto ainda.</p>
          )}
        </div>
      </section>
    </div>
  )
}

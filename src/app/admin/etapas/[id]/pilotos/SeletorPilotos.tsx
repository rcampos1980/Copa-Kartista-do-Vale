'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { salvarParticipantes } from './actions'
import { Check, Save, Users } from 'lucide-react'

type Piloto = { id: string; nome: string; numero_kart: number | null; foto_url: string | null }

type Props = {
  etapaId: string
  pilotos: Piloto[]
  selecionadosIniciais: string[]
}

export function SeletorPilotos({ etapaId, pilotos, selecionadosIniciais }: Props) {
  const router = useRouter()
  const [sel, setSel] = useState<Set<string>>(new Set(selecionadosIniciais))
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')

  function toggle(id: string) {
    setSel((prev) => {
      const novo = new Set(prev)
      if (novo.has(id)) novo.delete(id)
      else novo.add(id)
      return novo
    })
  }

  function marcarTodos() {
    setSel(new Set(pilotos.map((p) => p.id)))
  }
  function limparTodos() {
    setSel(new Set())
  }

  async function salvar() {
    setSalvando(true)
    setMsg('')
    await salvarParticipantes(etapaId, Array.from(sel))
    setSalvando(false)
    setMsg('Participantes salvos!')
    router.refresh()
  }

  return (
    <section className="bg-surface border border-border rounded-2xl p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display uppercase text-sm tracking-wide text-white/50 flex items-center gap-2">
          <Users size={16} /> Quem corre nesta etapa ({sel.size})
        </h2>
        <div className="flex gap-2">
          <button onClick={marcarTodos} className="text-white/50 hover:text-white text-xs">
            Marcar todos
          </button>
          <span className="text-white/20">·</span>
          <button onClick={limparTodos} className="text-white/50 hover:text-white text-xs">
            Limpar
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {pilotos.map((p) => {
          const marcado = sel.has(p.id)
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                marcado ? 'border-accent/40 bg-accent/5' : 'border-border bg-bg'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  marcado ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-transparent'
                }`}
              >
                <Check size={15} />
              </span>
              <span className="flex-1 text-white text-sm font-medium truncate">
                {p.nome}
              </span>
            </button>
          )
        })}
        {pilotos.length === 0 && (
          <p className="text-white/40 text-sm">Nenhum piloto ativo. Cadastre pilotos ativos primeiro.</p>
        )}
      </div>

      <button
        onClick={salvar}
        disabled={salvando}
        className="mt-5 w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-colors"
      >
        <Save size={18} />
        {salvando ? 'Salvando...' : 'Salvar participantes'}
      </button>
      {msg && <p className="mt-3 text-sm text-emerald-400">{msg}</p>}
    </section>
  )
}

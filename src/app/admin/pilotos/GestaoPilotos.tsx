'use client'

import { useMemo, useState } from 'react'
import { FormPiloto } from './FormPiloto'
import { LinhaPiloto } from './LinhaPiloto'
import { Plus, Search, X } from 'lucide-react'

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
  email?: string | null
  is_admin?: boolean
  foto_url?: string | null
}

type Resultado = { ok: boolean; mensagem: string }

type Props = {
  pilotos: Piloto[]
  salvarPiloto: (formData: FormData) => Promise<Resultado>
  alternarAtivo: (id: string, ativo: boolean) => Promise<void>
  reenviarAcesso: (pilotoId: string) => Promise<Resultado>
}

export function GestaoPilotos({ pilotos, salvarPiloto, alternarAtivo, reenviarAcesso }: Props) {
  const [painel, setPainel] = useState<'fechado' | 'novo' | 'editando'>('fechado')
  const [editando, setEditando] = useState<Piloto | null>(null)
  const [busca, setBusca] = useState('')

  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return pilotos
    return pilotos.filter(
      (p) =>
        p.nome.toLowerCase().includes(t) ||
        (p.email ?? '').toLowerCase().includes(t) ||
        (p.cidade ?? '').toLowerCase().includes(t)
    )
  }, [pilotos, busca])

  const ativos = pilotos.filter((p) => p.ativo).length
  const comAcesso = pilotos.filter((p) => p.email).length

  function abrirNovo() {
    setEditando(null)
    setPainel('novo')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function abrirEdicao(id: string) {
    const p = pilotos.find((x) => x.id === id)
    if (!p) return
    setEditando(p)
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
              {painel === 'editando' ? `Editando: ${editando?.nome}` : 'Novo piloto'}
            </h2>
            <button
              onClick={fechar}
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs transition-colors"
            >
              <X size={14} /> Fechar
            </button>
          </div>
          <div className="max-w-xl">
            <FormPiloto salvarPiloto={salvarPiloto} pilotoEditando={editando} onSalvo={fechar} />
          </div>
        </section>
      )}

      <section className="bg-surface border border-border rounded-2xl p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display uppercase text-sm tracking-wide text-white/50">
              Pilotos cadastrados
            </h2>
            <p className="text-white/30 text-xs mt-0.5">
              {pilotos.length} no total · {ativos} ativos · {comAcesso} com acesso ao site
            </p>
          </div>
          {painel === 'fechado' && (
            <button
              onClick={abrirNovo}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl px-4 py-2.5 text-sm transition-colors"
            >
              <Plus size={16} /> Novo piloto
            </button>
          )}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={15} />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail ou cidade"
            className="w-full bg-bg border border-border rounded-xl pl-9 pr-3 py-2.5 text-white text-sm outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
          {filtrados.map((p) => (
            <LinhaPiloto
              key={p.id}
              piloto={p}
              alternarAtivo={alternarAtivo}
              onEditar={abrirEdicao}
              reenviarAcesso={reenviarAcesso}
            />
          ))}
        </div>

        {filtrados.length === 0 && (
          <p className="text-white/40 text-sm py-4">
            {busca ? 'Nenhum piloto encontrado para essa busca.' : 'Nenhum piloto ainda.'}
          </p>
        )}
      </section>
    </div>
  )
}

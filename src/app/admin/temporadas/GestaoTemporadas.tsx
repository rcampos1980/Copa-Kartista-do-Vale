'use client'

import { useState } from 'react'
import { Plus, X, Eye, EyeOff, Pencil, CalendarRange } from 'lucide-react'

type Temporada = {
  id: string
  ano: number
  nome: string | null
  visivel?: boolean
  regulamento?: string | null
  peso_alvo?: number | null
  bonus_melhor_volta?: number | null
}

type Resultado = { ok: boolean; mensagem: string }

type Props = {
  temporadas: Temporada[]
  criarTemporada: (formData: FormData) => Promise<Resultado>
  salvarTemporada: (formData: FormData) => Promise<Resultado>
  alternarVisibilidade: (id: string, visivel: boolean) => Promise<Resultado>
}

const input =
  'w-full bg-bg border border-border rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-accent transition-colors'
const rotulo = 'text-white/60 text-xs block mb-1'

export function GestaoTemporadas({
  temporadas,
  criarTemporada,
  salvarTemporada,
  alternarVisibilidade,
}: Props) {
  const [painel, setPainel] = useState<'fechado' | 'nova' | 'editando'>('fechado')
  const [editando, setEditando] = useState<Temporada | null>(null)
  const [visivel, setVisivel] = useState(true)
  const [aviso, setAviso] = useState<Resultado | null>(null)
  const [salvando, setSalvando] = useState(false)

  function abrirNova() {
    setEditando(null)
    setVisivel(true)
    setAviso(null)
    setPainel('nova')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function abrirEdicao(t: Temporada) {
    setEditando(t)
    setVisivel(t.visivel ?? true)
    setAviso(null)
    setPainel('editando')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function fechar() {
    setPainel('fechado')
    setEditando(null)
    setAviso(null)
  }

  async function enviar(formData: FormData) {
    setSalvando(true)
    setAviso(null)
    formData.set('visivel', visivel ? 'true' : 'false')
    if (editando) formData.set('id', editando.id)
    const r = editando ? await salvarTemporada(formData) : await criarTemporada(formData)
    setSalvando(false)
    setAviso(r)
    if (r.ok && !editando) fechar()
  }

  async function trocarVisibilidade(t: Temporada) {
    const r = await alternarVisibilidade(t.id, t.visivel ?? true)
    setAviso(r)
  }

  return (
    <div className="flex flex-col gap-5">
      {painel !== 'fechado' && (
        <section className="bg-surface border border-accent/30 rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display uppercase text-sm tracking-wide text-white/50">
              {painel === 'editando' ? `Temporada ${editando?.ano}` : 'Nova temporada'}
            </h2>
            <button onClick={fechar} className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs">
              <X size={14} /> Fechar
            </button>
          </div>

          <form action={enviar} className="flex flex-col gap-3 max-w-2xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={rotulo}>Ano *</label>
                <input
                  name="ano"
                  type="number"
                  required
                  defaultValue={editando?.ano ?? new Date().getFullYear() + 1}
                  disabled={Boolean(editando)}
                  className={`${input} disabled:opacity-50`}
                />
              </div>
              <div>
                <label className={rotulo}>Nome do campeonato *</label>
                <input
                  name="nome"
                  required
                  defaultValue={editando?.nome ?? 'Copa Kartista do Vale'}
                  className={input}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={rotulo}>Peso-alvo (kg)</label>
                <input
                  name="peso_alvo"
                  type="number"
                  defaultValue={editando?.peso_alvo ?? 90}
                  className={input}
                />
              </div>
              <div>
                <label className={rotulo}>Bônus da volta rápida</label>
                <input
                  name="bonus_melhor_volta"
                  type="number"
                  defaultValue={editando?.bonus_melhor_volta ?? 2}
                  className={input}
                />
              </div>
            </div>

            {painel === 'editando' && (
              <div>
                <label className={rotulo}>Regulamento</label>
                <textarea
                  name="regulamento"
                  rows={14}
                  defaultValue={editando?.regulamento ?? ''}
                  className={`${input} font-mono text-[13px] leading-relaxed`}
                  placeholder={'REGULAMENTO 2026\n\n1. PARTICIPAÇÃO\nO campeonato é disputado por pilotos fixos e convidados.\n\n2. LASTRO\nO peso-alvo é de 90 kg...'}
                />
                <p className="mt-1 text-white/30 text-[11px]">
                  As quebras de linha são preservadas na página. Deixe uma linha em branco entre os parágrafos.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setVisivel((v) => !v)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors w-fit ${
                visivel
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-white/40 border border-border'
              }`}
            >
              {visivel ? <Eye size={16} /> : <EyeOff size={16} />}
              {visivel ? 'Visível para os pilotos' : 'Oculta para os pilotos'}
            </button>

            {aviso && (
              <p
                className={`rounded-xl border px-3 py-2.5 text-sm ${
                  aviso.ok
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-500/40 bg-red-500/10 text-red-300'
                }`}
              >
                {aviso.mensagem}
              </p>
            )}

            <button
              type="submit"
              disabled={salvando}
              className="mt-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 transition-colors w-fit"
            >
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar temporada'}
            </button>
          </form>
        </section>
      )}

      <section className="bg-surface border border-border rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display uppercase text-sm tracking-wide text-white/50">
              Temporadas
            </h2>
            <p className="text-white/30 text-xs mt-0.5">
              {temporadas.length} no total · {temporadas.filter((t) => t.visivel).length} visíveis
            </p>
          </div>
          {painel === 'fechado' && (
            <button
              onClick={abrirNova}
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl px-4 py-2.5 text-sm transition-colors"
            >
              <Plus size={16} /> Nova temporada
            </button>
          )}
        </div>

        {painel === 'fechado' && aviso && (
          <p
            className={`mb-3 rounded-xl border px-3 py-2.5 text-sm ${
              aviso.ok
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-red-500/40 bg-red-500/10 text-red-300'
            }`}
          >
            {aviso.mensagem}
          </p>
        )}

        <div className="flex flex-col gap-2">
          {temporadas.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-3 rounded-xl border border-border px-3 py-3 ${
                t.visivel ? 'bg-bg' : 'bg-bg/40 opacity-60'
              }`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface border border-border shrink-0">
                <CalendarRange className="text-accent" size={17} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {t.ano}
                  <span className="text-white/40"> · {t.nome ?? 'Sem nome'}</span>
                </p>
                <p className="text-white/40 text-xs">
                  Alvo {t.peso_alvo ?? 90} kg · bônus {t.bonus_melhor_volta ?? 0} ·{' '}
                  {t.regulamento ? 'com regulamento' : 'sem regulamento'}
                </p>
              </div>
              <button
                onClick={() => trocarVisibilidade(t)}
                className="text-white/40 hover:text-white p-2 transition-colors shrink-0"
                title={t.visivel ? 'Ocultar dos pilotos' : 'Mostrar para os pilotos'}
              >
                {t.visivel ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              <button
                onClick={() => abrirEdicao(t)}
                className="text-white/40 hover:text-accent p-2 transition-colors shrink-0"
                title="Editar e escrever o regulamento"
              >
                <Pencil size={16} />
              </button>
            </div>
          ))}
          {temporadas.length === 0 && (
            <p className="text-white/40 text-sm">Nenhuma temporada cadastrada.</p>
          )}
        </div>
      </section>
    </div>
  )
}

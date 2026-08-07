'use client'

import { useState } from 'react'
import { Weight, ChevronDown, RefreshCw, Lock, SlidersHorizontal, Check } from 'lucide-react'
import { BotaoImprimir } from './BotaoImprimir'

type Item = {
  piloto_id: string
  piloto_nome: string
  tipo: string
  peso: number
  lastro: number
  congelado?: boolean
}

type Resultado = { ok: boolean; mensagem: string }

type Props = {
  etapaId: string
  itens: Item[]
  pesoAlvo: number
  linhaImpressao: string
  nomeArquivo: string
  isAdmin: boolean
  recalcularLastro: (etapaId: string) => Promise<Resultado>
  ajustarLastro: (etapaId: string, pilotoId: string, valor: number) => Promise<Resultado>
}

function CampoLastro({
  etapaId,
  item,
  ajustar,
  aoResponder,
}: {
  etapaId: string
  item: Item
  ajustar: (etapaId: string, pilotoId: string, valor: number) => Promise<Resultado>
  aoResponder: (r: Resultado) => void
}) {
  const [valor, setValor] = useState(String(item.lastro))
  const [salvando, setSalvando] = useState(false)

  async function confirmar() {
    const n = Number(valor)
    if (Number.isNaN(n) || n === item.lastro) {
      setValor(String(item.lastro))
      return
    }
    setSalvando(true)
    const r = await ajustar(etapaId, item.piloto_id, n)
    setSalvando(false)
    aoResponder(r)
  }

  return (
    <input
      type="number"
      value={valor}
      disabled={salvando}
      onChange={(e) => setValor(e.target.value)}
      onBlur={confirmar}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
      }}
      className="w-20 md:w-24 bg-bg border border-border rounded-lg px-2 py-1 text-right font-display font-bold text-accent text-lg outline-none focus:border-accent disabled:opacity-50 print:hidden"
    />
  )
}

export function PainelLastro({
  etapaId,
  itens,
  pesoAlvo,
  linhaImpressao,
  nomeArquivo,
  isAdmin,
  recalcularLastro,
  ajustarLastro,
}: Props) {
  const [aberto, setAberto] = useState(false)
  const [aviso, setAviso] = useState<Resultado | null>(null)
  const [recalculando, setRecalculando] = useState(false)
  const [editando, setEditando] = useState(false)

  const ordenados = [...itens].sort((a, b) =>
    a.piloto_nome.localeCompare(b.piloto_nome, 'pt-BR', { sensitivity: 'base' })
  )

  const congelados = ordenados.filter((i) => i.congelado).length

  const faixas = Object.entries(
    ordenados.reduce<Record<number, number>>((acc, i) => {
      acc[i.lastro] = (acc[i.lastro] ?? 0) + 1
      return acc
    }, {})
  )
    .map(([valor, qtd]) => ({ valor: Number(valor), qtd }))
    .sort((a, b) => b.valor - a.valor)

  async function recalcular() {
    if (!confirm('Recalcular o lastro desta etapa pelos pesos atuais? Ajustes manuais serão substituídos.')) return
    setRecalculando(true)
    setAviso(null)
    const r = await recalcularLastro(etapaId)
    setRecalculando(false)
    setAviso(r)
  }

  return (
    <div className="area-impressao mb-10">
      <div className="rounded-2xl border border-accent/30 bg-surface overflow-hidden print:border-0">
        <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-border print:border-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 border border-accent/30 shrink-0 print:hidden">
              <Weight className="text-accent" size={20} />
            </span>
            <div className="min-w-0">
              <p className="font-display font-bold text-white text-lg leading-tight">
                Relatório de lastro
              </p>
              <p className="text-white/40 text-xs flex items-center gap-1.5">
                Peso-alvo {pesoAlvo} kg · {ordenados.length} pilotos
                {congelados > 0 && (
                  <span className="inline-flex items-center gap-1 text-white/30">
                    <Lock size={10} /> congelado
                  </span>
                )}
              </p>
              <p className="hidden print:block text-sm">{linhaImpressao}</p>
            </div>
          </div>
          <div className="print:hidden shrink-0">
            <BotaoImprimir nomeArquivo={nomeArquivo} />
          </div>
        </div>

        {faixas.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 md:px-6 py-4 print:hidden">
            {faixas.map((f) => (
              <span
                key={f.valor}
                className={`inline-flex items-baseline gap-1.5 rounded-xl border px-3 py-2 ${
                  f.valor > 0 ? 'border-accent/30 bg-accent/10' : 'border-border bg-bg'
                }`}
              >
                <span className={`font-display font-bold text-xl leading-none ${f.valor > 0 ? 'text-accent' : 'text-white/50'}`}>
                  {f.valor}
                </span>
                <span className="text-white/40 text-[11px]">kg</span>
                <span className="text-white/30 text-[11px]">·</span>
                <span className="text-white/60 text-xs">
                  {f.qtd} {f.qtd === 1 ? 'piloto' : 'pilotos'}
                </span>
              </span>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="w-full flex items-center justify-center gap-2 border-t border-border px-4 py-3 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors print:hidden"
        >
          {aberto ? 'Ocultar tabela' : 'Ver tabela completa'}
          <ChevronDown className={`transition-transform ${aberto ? 'rotate-180' : ''}`} size={16} />
        </button>

        <div className={aberto ? 'block' : 'hidden print:block'}>
          {isAdmin && (
            <div className="border-t border-border px-4 md:px-6 py-3 flex flex-wrap items-center gap-3 print:hidden">
              <button
                onClick={recalcular}
                disabled={recalculando}
                className="flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2 text-sm text-white/70 hover:text-white hover:border-accent/50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={recalculando ? 'animate-spin' : ''} size={15} />
                {recalculando ? 'Atualizando...' : 'Atualizar pelos pesos atuais'}
              </button>
              <button
                onClick={() => setEditando((v) => !v)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                  editando
                    ? 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                    : 'border-border bg-bg text-white/70 hover:text-white hover:border-accent/50'
                }`}
              >
                {editando ? <Check size={15} /> : <SlidersHorizontal size={15} />}
                {editando ? 'Concluir ajuste' : 'Ajuste manual'}
              </button>
              {editando && (
                <span className="text-amber-300/70 text-xs">
                  Toque no lastro do piloto, digite o novo valor e aperte Enter.
                </span>
              )}
            </div>
          )}

          {aviso && (
            <p className={`mx-4 md:mx-6 mt-3 rounded-xl border px-3 py-2.5 text-sm print:hidden ${aviso.ok ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-red-500/40 bg-red-500/10 text-red-300'}`}>
              {aviso.mensagem}
            </p>
          )}

          {ordenados.length === 0 ? (
            <p className="text-white/40 text-sm px-4 md:px-6 py-5">
              Nenhum peso cadastrado ainda. Cadastre o peso dos pilotos na área de administração.
            </p>
          ) : (
            <div>
              <div className="flex items-center gap-4 px-4 md:px-6 py-2.5 border-t border-border bg-bg/50 text-white/40 text-xs uppercase tracking-wide print:bg-transparent">
                <span className="flex-1">Piloto</span>
                <span className="w-20 text-right print:hidden">Peso</span>
                <span className="w-24 text-right">Lastro</span>
                <span className="w-20 text-right hidden md:inline print:hidden">Total</span>
              </div>
              {ordenados.map((l) => (
                <div key={l.piloto_id} className="flex items-center gap-4 px-4 md:px-6 py-3 border-t border-border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate">{l.piloto_nome}</span>
                      {l.tipo === 'convidado' && (
                        <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-400 shrink-0">
                          Convidado
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="w-16 md:w-20 text-right text-white/70 text-sm print:hidden">
                    {Number(l.peso).toFixed(0)} kg
                  </span>
                  {isAdmin && editando ? (
                    <div className="w-20 md:w-24 flex justify-end">
                      <CampoLastro etapaId={etapaId} item={l} ajustar={ajustarLastro} aoResponder={setAviso} />
                      <span className="hidden print:inline font-display font-bold text-lg">{l.lastro} kg</span>
                    </div>
                  ) : (
                    <span className="w-20 md:w-24 text-right font-display font-bold text-accent text-lg">
                      {l.lastro} kg
                    </span>
                  )}
                  <span className="w-16 md:w-20 text-right text-white/50 text-sm hidden md:inline print:hidden">
                    {Number(l.peso) + Number(l.lastro)} kg
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

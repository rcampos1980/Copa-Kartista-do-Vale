'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Trophy,
  Medal,
  Zap,
  Target,
  Flag,
  Users,
  LayoutGrid,
  TrendingUp,
  ChevronRight,
  Share2,
  Printer,
} from 'lucide-react'

export type LinhaPiloto = {
  piloto_id: string
  nome: string
  foto: string | null
  corridas: number
  vitorias: number
  podios: number
  voltas: number
  melhorPos: number
  somaPos: number
  pontos: number
}

export type Destaque = {
  chave: 'vitorias' | 'podios' | 'voltas' | 'regular'
  rotulo: string
  nomes: string[]
  valor: number
  sufixo: string
  dica: string
}

type Props = {
  ano: number
  destaques: Destaque[]
  linhas: LinhaPiloto[]
  etapasRealizadas: number
  totalEtapas: number
  vencedores: number
  tetoPorCorrida: number
  pontosPrimeiro: number
  bonusVolta: number
}

const ICONES = {
  vitorias: { Icone: Trophy, cor: 'text-gold' },
  podios: { Icone: Medal, cor: 'text-silver' },
  voltas: { Icone: Zap, cor: 'text-accent' },
  regular: { Icone: Target, cor: 'text-bronze' },
}

function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/)
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase()
}

function Avatares({ pilotos }: { pilotos: LinhaPiloto[] }) {
  if (pilotos.length === 0) return null
  const visiveis = pilotos.slice(0, 3)
  const resto = pilotos.length - visiveis.length

  return (
    <div className="mt-2.5 flex items-center">
      <div className="flex -space-x-2">
        {visiveis.map((p) => (
          <span
            key={p.piloto_id}
            title={p.nome}
            className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border border-surface bg-bg text-[8px] font-display font-bold text-white/50"
          >
            {p.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.foto} alt={p.nome} className="h-full w-full object-cover" />
            ) : (
              iniciais(p.nome)
            )}
          </span>
        ))}
      </div>
      {resto > 0 && <span className="ml-2 text-white/40 text-[11px] num-tab">+{resto}</span>}
    </div>
  )
}

export function PainelEstatisticas({
  ano,
  destaques,
  linhas,
  etapasRealizadas,
  totalEtapas,
  vencedores,
  tetoPorCorrida,
  pontosPrimeiro,
  bonusVolta,
}: Props) {
  const [aba, setAba] = useState<'geral' | 'desempenho' | 'ranking'>('geral')
  const [verTodos, setVerTodos] = useState(false)

  const maxPontos = linhas[0]?.pontos ?? 0
  const listaTabela = verTodos ? linhas : linhas.slice(0, 5)
  const comVitoria = linhas.filter((l) => l.vitorias > 0)

  const abas = [
    { chave: 'geral' as const, rotulo: 'Geral', Icone: LayoutGrid },
    { chave: 'desempenho' as const, rotulo: 'Desempenho', Icone: TrendingUp },
    { chave: 'ranking' as const, rotulo: 'Ranking', Icone: Trophy },
  ]

  function compartilhar() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const topo = linhas
      .slice(0, 5)
      .map((l, i) => `${`${i + 1}º`.padStart(3, ' ')}  ${l.nome} — ${l.pontos} pts`)
      .join('\n')
    const marcos = destaques
      .filter((d) => d.nomes.length > 0)
      .map((d) => `${d.rotulo}: ${d.nomes.join(', ')} (${d.valor} ${d.sufixo})`)
      .join('\n')
    const texto = `*COPA KARTISTA DO VALE ${ano}*\nEstatísticas após ${etapasRealizadas} ${
      etapasRealizadas === 1 ? 'etapa' : 'etapas'
    }\n\n${marcos}\n\n${topo}\n\nNúmeros completos: ${url}`

    if (navigator.share) {
      navigator.share({ title: `Estatísticas ${ano}`, text: texto }).catch(() => {})
      return
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
  }

  const cartao = 'rounded-2xl border border-border bg-surface'
  const rotulo = 'text-white/40 text-[10px] uppercase tracking-widest'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <div className="flex flex-1 min-w-0 gap-2 overflow-x-auto">
          {abas.map((a) => {
            const ativo = aba === a.chave
            return (
              <button
                key={a.chave}
                onClick={() => setAba(a.chave)}
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  ativo
                    ? 'border-accent/60 bg-accent/15 text-white'
                    : 'border-border bg-surface text-white/40 hover:text-white'
                }`}
              >
                <a.Icone size={16} className={ativo ? 'text-accent' : ''} />
                {a.rotulo}
              </button>
            )
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={compartilhar}
            title="Compartilhar os números no WhatsApp"
            className="flex items-center justify-center rounded-xl border border-border bg-surface h-[42px] w-[42px] text-white/40 hover:text-white hover:border-accent/50 transition-colors"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={() => window.print()}
            title="Salvar esta tela em PDF"
            className="flex items-center justify-center rounded-xl border border-border bg-surface h-[42px] w-[42px] text-white/40 hover:text-white hover:border-accent/50 transition-colors"
          >
            <Printer size={16} />
          </button>
        </div>
      </div>

      {aba === 'geral' && (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {destaques.map((d) => {
              const { Icone, cor } = ICONES[d.chave]
              return (
                <div key={d.chave} className={`${cartao} p-4 flex flex-col`}>
                  <div className="flex items-center gap-2 mb-3" title={d.dica}>
                    <Icone className={cor} size={15} />
                    <span className={rotulo}>{d.rotulo}</span>
                  </div>

                  <div className="flex-1 flex flex-col gap-0.5">
                    {d.nomes.length === 0 && (
                      <p className="font-display font-bold text-white/25 text-base leading-tight">
                        —
                      </p>
                    )}
                    {d.nomes.map((nome) => (
                      <p
                        key={nome}
                        className={`font-display font-bold text-white leading-tight truncate ${
                          d.nomes.length > 2 ? 'text-sm' : 'text-lg'
                        }`}
                      >
                        {nome}
                      </p>
                    ))}
                  </div>

                  <p className="mt-3 flex items-baseline gap-1.5">
                    <span className="font-display font-bold text-accent text-3xl leading-none num-tab">
                      {d.valor}
                    </span>
                    <span className="text-white/40 text-[11px]">{d.sufixo}</span>
                  </p>
                </div>
              )
            })}
          </section>

          <section className="grid grid-cols-3 gap-2.5 md:gap-3">
            <div className={`${cartao} p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <Flag className="text-white/40" size={15} />
                <span className={rotulo}>Etapas</span>
              </div>
              <p className="font-display font-bold text-white text-3xl leading-none num-tab">
                {etapasRealizadas}
              </p>
              <p className="mt-1 text-white/40 text-xs">de {totalEtapas} no ano</p>
              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: totalEtapas ? `${(etapasRealizadas / totalEtapas) * 100}%` : '0%',
                  }}
                />
              </div>
            </div>

            <div className={`${cartao} p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <Users className="text-white/40" size={15} />
                <span className={rotulo}>Pilotos</span>
              </div>
              <p className="font-display font-bold text-white text-3xl leading-none num-tab">
                {linhas.length}
              </p>
              <p className="mt-1 text-white/40 text-xs">com resultado</p>
              <Avatares pilotos={linhas} />
            </div>

            <div className={`${cartao} p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="text-white/40" size={15} />
                <span className={rotulo}>Vencedores</span>
              </div>
              <p className="font-display font-bold text-white text-3xl leading-none num-tab">
                {vencedores}
              </p>
              <p className="mt-1 text-white/40 text-xs">
                {vencedores === 1 ? 'piloto diferente' : 'pilotos diferentes'}
              </p>
              <Avatares pilotos={comVitoria} />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display uppercase text-sm tracking-wide text-white/50">
                Números por piloto
              </h2>
              {linhas.length > 5 && (
                <button
                  onClick={() => setVerTodos((v) => !v)}
                  className="flex items-center gap-1 text-accent hover:text-accent/80 text-[11px] font-medium uppercase tracking-wide transition-colors print:hidden"
                >
                  {verTodos ? 'Ver menos' : 'Ver todos'} <ChevronRight size={13} />
                </button>
              )}
            </div>

            <div className={`${cartao} overflow-hidden`}>
              <div className="flex items-center gap-2 px-3 md:px-5 py-2.5 border-b border-border text-white/40 text-[10px] uppercase tracking-widest">
                <span className="w-5" />
                <span className="flex-1">Piloto</span>
                <span className="w-9 text-right">Etp</span>
                <span className="w-9 text-right">Vit</span>
                <span className="w-9 text-right">Pód</span>
                <span className="w-12 text-right">Pts</span>
              </div>

              {listaTabela.map((l, i) => (
                <div key={l.piloto_id} className="border-b border-border last:border-b-0">
                  <Link
                    href={`/pilotos/${l.piloto_id}`}
                    className="flex items-center gap-2 px-3 md:px-5 py-3 hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="w-5 text-white/30 text-xs num-tab">{i + 1}</span>
                    <span className="flex-1 min-w-0 font-medium text-white truncate">{l.nome}</span>
                    <span className="w-9 text-right text-white/50 text-sm num-tab">
                      {l.corridas}
                    </span>
                    <span
                      className={`w-9 text-right text-sm num-tab ${
                        l.vitorias ? 'text-gold font-medium' : 'text-white/25'
                      }`}
                    >
                      {l.vitorias}
                    </span>
                    <span
                      className={`w-9 text-right text-sm num-tab ${
                        l.podios ? 'text-white/80' : 'text-white/25'
                      }`}
                    >
                      {l.podios}
                    </span>
                    <span className="w-12 text-right font-display font-bold text-white text-lg num-tab">
                      {l.pontos}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {aba === 'desempenho' && (
        <section className="flex flex-col gap-2.5">
          {[...linhas]
            .sort((a, b) => {
              const ta = tetoPorCorrida * a.corridas
              const tb = tetoPorCorrida * b.corridas
              return (tb ? b.pontos / tb : 0) - (ta ? a.pontos / ta : 0)
            })
            .map((l) => {
            const teto = tetoPorCorrida * l.corridas
            const aproveitamento = teto ? (l.pontos / teto) * 100 : 0
            const media = l.corridas ? l.somaPos / l.corridas : 0
            return (
              <div key={l.piloto_id} className={`${cartao} p-4`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg text-[11px] font-display font-bold text-white/50">
                    {l.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.foto} alt={l.nome} className="h-full w-full object-cover" />
                    ) : (
                      iniciais(l.nome)
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-bold text-white leading-tight truncate">
                      {l.nome}
                    </span>
                    <span className="text-white/40 text-xs">
                      {l.corridas} {l.corridas === 1 ? 'etapa' : 'etapas'} · melhor{' '}
                      {l.melhorPos === 99 ? '—' : `${l.melhorPos}º`} · média {media.toFixed(1)}
                    </span>
                  </span>

                  <span className="shrink-0 text-right">
                    <span className="block font-display font-bold text-white text-xl leading-none num-tab">
                      {l.pontos}
                    </span>
                    <span className="text-white/40 text-[10px] uppercase tracking-widest">pts</span>
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${aproveitamento}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-white/40 text-[11px] num-tab">
                    {Math.round(aproveitamento)}%
                  </span>
                </div>
              </div>
            )
          })}
          <p className="text-white/25 text-xs">
            Aproveitamento = pontos somados dividido pelo máximo possível nas etapas que o piloto
            correu — {tetoPorCorrida} por corrida, sendo {pontosPrimeiro} da vitória e {bonusVolta}{' '}
            da volta rápida. Quem correu menos etapas não é penalizado.
          </p>
        </section>
      )}

      {aba === 'ranking' && (
        <section>
          <div className={`${cartao} overflow-hidden`}>
            <div className="flex items-center gap-2 px-3 md:px-5 py-2.5 border-b border-border text-white/40 text-[10px] uppercase tracking-widest">
              <span className="w-5" />
              <span className="flex-1">Piloto</span>
              <span className="w-9 text-right">Etp</span>
              <span className="w-9 text-right">Vit</span>
              <span className="w-9 text-right">Pód</span>
              <span className="w-9 text-right">VR</span>
              <span className="w-12 text-right hidden sm:inline">Melhor</span>
              <span className="w-12 text-right hidden sm:inline">Média</span>
              <span className="w-12 text-right">Pts</span>
            </div>

            {linhas.map((l, i) => (
              <div key={l.piloto_id} className="relative border-b border-border last:border-b-0">
                <div
                  className="absolute inset-y-0 left-0 bg-accent/[0.07]"
                  style={{ width: maxPontos ? `${(l.pontos / maxPontos) * 100}%` : '0%' }}
                />
                <Link
                  href={`/pilotos/${l.piloto_id}`}
                  className="relative flex items-center gap-2 px-3 md:px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
                >
                  <span className="w-5 text-white/30 text-xs num-tab">{i + 1}</span>
                  <span className="flex-1 min-w-0 font-medium text-white truncate">{l.nome}</span>
                  <span className="w-9 text-right text-white/50 text-sm num-tab">{l.corridas}</span>
                  <span
                    className={`w-9 text-right text-sm num-tab ${
                      l.vitorias ? 'text-gold font-medium' : 'text-white/25'
                    }`}
                  >
                    {l.vitorias}
                  </span>
                  <span
                    className={`w-9 text-right text-sm num-tab ${
                      l.podios ? 'text-white/80' : 'text-white/25'
                    }`}
                  >
                    {l.podios}
                  </span>
                  <span
                    className={`w-9 text-right text-sm num-tab ${
                      l.voltas ? 'text-accent' : 'text-white/25'
                    }`}
                  >
                    {l.voltas}
                  </span>
                  <span className="w-12 text-right text-white/50 text-sm num-tab hidden sm:inline">
                    {l.melhorPos === 99 ? '—' : `${l.melhorPos}º`}
                  </span>
                  <span className="w-12 text-right text-white/50 text-sm num-tab hidden sm:inline">
                    {(l.somaPos / Math.max(1, l.corridas)).toFixed(1)}
                  </span>
                  <span className="w-12 text-right font-display font-bold text-white text-lg num-tab">
                    {l.pontos}
                  </span>
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-2 text-white/40 text-xs">
            Etp = etapas · Vit = vitórias · Pód = pódios · VR = voltas rápidas · Melhor = melhor
            chegada · Média = posição média
          </p>
        </section>
      )}
    </div>
  )
}

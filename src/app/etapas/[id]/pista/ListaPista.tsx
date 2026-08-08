'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, ArrowDownWideNarrow, ArrowDownAZ, RotateCcw } from 'lucide-react'

type Item = {
  piloto_id: string
  piloto_nome: string
  tipo: string
  peso: number
  lastro: number
}

export function ListaPista({ etapaId, itens }: { etapaId: string; itens: Item[] }) {
  const chave = `pista-${etapaId}`
  const [conferidos, setConferidos] = useState<string[]>([])
  const [ordem, setOrdem] = useState<'nome' | 'lastro'>('nome')
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(chave)
      if (salvo) setConferidos(JSON.parse(salvo))
    } catch {}
    setPronto(true)
  }, [chave])

  useEffect(() => {
    if (!pronto) return
    try {
      localStorage.setItem(chave, JSON.stringify(conferidos))
    } catch {}
  }, [conferidos, chave, pronto])

  const lista = useMemo(() => {
    const copia = [...itens]
    if (ordem === 'lastro') {
      copia.sort((a, b) => b.lastro - a.lastro || a.piloto_nome.localeCompare(b.piloto_nome, 'pt-BR'))
    } else {
      copia.sort((a, b) => a.piloto_nome.localeCompare(b.piloto_nome, 'pt-BR', { sensitivity: 'base' }))
    }
    return copia
  }, [itens, ordem])

  function alternar(id: string) {
    setConferidos((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
    )
    if (navigator.vibrate) navigator.vibrate(15)
  }

  const feitos = conferidos.length
  const total = itens.length
  const percentual = total ? Math.round((feitos / total) * 100) : 0

  const botao =
    'flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-white/60 hover:text-white transition-colors'

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 md:-mx-10 px-4 md:px-10 py-3 bg-bg/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="font-display font-bold text-white text-lg num-tab">
            {feitos} <span className="text-white/30">de {total}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOrdem(ordem === 'nome' ? 'lastro' : 'nome')}
              className={botao}
            >
              {ordem === 'nome' ? <ArrowDownAZ size={14} /> : <ArrowDownWideNarrow size={14} />}
              {ordem === 'nome' ? 'Nome' : 'Lastro'}
            </button>
            {feitos > 0 && (
              <button onClick={() => setConferidos([])} className={botao}>
                <RotateCcw size={14} /> Limpar
              </button>
            )}
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${percentual}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {lista.map((p) => {
          const feito = conferidos.includes(p.piloto_id)
          return (
            <button
              key={p.piloto_id}
              onClick={() => alternar(p.piloto_id)}
              className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-colors ${
                feito
                  ? 'border-emerald-500/35 bg-emerald-500/[0.07]'
                  : 'border-border bg-surface active:bg-white/5'
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl border shrink-0 transition-colors ${
                  feito ? 'border-emerald-500/50 bg-emerald-500/20' : 'border-border bg-bg'
                }`}
              >
                {feito && <Check className="text-emerald-400" size={19} />}
              </span>

              <span className="flex-1 min-w-0">
                <span className={`block font-display font-bold text-lg leading-tight truncate ${feito ? 'text-white/45 line-through' : 'text-white'}`}>
                  {p.piloto_nome}
                </span>
                <span className="block text-white/35 text-xs mt-0.5">
                  {Number(p.peso).toFixed(0)} kg
                  {p.tipo === 'convidado' && ' · convidado'}
                </span>
              </span>

              <span className="text-right shrink-0">
                <span className={`block font-display font-bold text-3xl leading-none num-tab ${feito ? 'text-white/30' : 'text-accent'}`}>
                  {p.lastro}
                </span>
                <span className="block text-white/30 text-[10px] uppercase tracking-widest mt-0.5">kg</span>
              </span>
            </button>
          )
        })}
      </div>

      {feitos === total && total > 0 && (
        <p className="mt-6 text-center text-emerald-400 text-sm">
          Todos os {total} pilotos conferidos. Boa corrida.
        </p>
      )}
    </div>
  )
}

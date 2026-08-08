'use client'

import { useState } from 'react'
import { Share2, Check, Copy } from 'lucide-react'

type Piloto = { nome: string; pontos: number }

export function BotaoCompartilhar({
  ano,
  pilotos,
  etapas,
}: {
  ano: number
  pilotos: Piloto[]
  etapas: number
}) {
  const [copiado, setCopiado] = useState(false)

  function montarTexto() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const cabecalho = `*COPA KARTISTA DO VALE ${ano}*`
    const sub = etapas > 0
      ? `Classificação geral após ${etapas} ${etapas === 1 ? 'etapa' : 'etapas'}`
      : 'Classificação geral'

    const linhas = pilotos
      .slice(0, 20)
      .map((p, i) => {
        const pos = `${i + 1}º`.padStart(3, ' ')
        const destaque = i < 3 ? `*${pos}*` : pos
        return `${destaque}  ${p.nome} — ${p.pontos} pts`
      })
      .join('\n')

    return `${cabecalho}\n${sub}\n\n${linhas}\n\nTabela completa: ${url}`
  }

  async function compartilhar() {
    const texto = montarTexto()

    if (navigator.share) {
      try {
        await navigator.share({ title: `Copa Kartista do Vale ${ano}`, text: texto })
        return
      } catch {
        return
      }
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(montarTexto())
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {}
  }

  const botao =
    'inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-white/70 hover:text-white hover:border-accent/50 transition-colors'

  return (
    <div className="flex gap-2 print:hidden">
      <button onClick={compartilhar} className={botao}>
        <Share2 size={15} />
        Compartilhar
      </button>
      <button onClick={copiar} className={botao} title="Copiar a tabela em texto">
        {copiado ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
        {copiado ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}

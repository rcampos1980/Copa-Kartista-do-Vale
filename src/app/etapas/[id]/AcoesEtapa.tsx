'use client'

import { useState } from 'react'
import { Share2, CalendarPlus, Check, Weight } from 'lucide-react'

export function AcoesEtapa({
  etapaId,
  titulo,
  jaAconteceu,
}: {
  etapaId: string
  titulo: string
  jaAconteceu: boolean
}) {
  const [copiado, setCopiado] = useState(false)

  async function compartilhar() {
    const url = window.location.href
    const texto = jaAconteceu
      ? `Resultado da etapa ${titulo} — Copa Kartista do Vale`
      : `Próxima etapa: ${titulo} — Copa Kartista do Vale`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Copa Kartista do Vale', text: texto, url })
        return
      } catch {
        // usuario cancelou
        return
      }
    }

    try {
      await navigator.clipboard.writeText(`${texto}\n${url}`)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      // sem permissao de area de transferencia
    }
  }

  const botao =
    'inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-white/70 hover:text-white hover:border-accent/50 transition-colors'

  return (
    <div className="flex flex-wrap gap-2 mb-8 print:hidden">
      <button onClick={compartilhar} className={botao}>
        {copiado ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
        {copiado ? 'Link copiado' : 'Compartilhar'}
      </button>

      {!jaAconteceu && (
        <a href={`/etapas/${etapaId}/calendario`} className={botao}>
          <CalendarPlus size={15} />
          Adicionar ao calendário
        </a>
      )}

      <a href={`/etapas/${etapaId}/pista`} className={botao}>
        <Weight size={15} />
        Modo pista
      </a>
    </div>
  )
}

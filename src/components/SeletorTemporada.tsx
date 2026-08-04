'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { trocarTemporada } from '@/lib/temporadaActions'
import type { Temporada } from '@/lib/temporada'

type Props = {
  temporadas: Temporada[]
  anoAtual: number
}

export function SeletorTemporada({ temporadas, anoAtual }: Props) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()

  // Com uma unica temporada, mantem o mesmo visual de antes (so o texto)
  if (temporadas.length <= 1) {
    return (
      <p className="text-sm uppercase tracking-widest text-white/50 font-display">
        Temporada {anoAtual}
      </p>
    )
  }

  function selecionar(ano: number) {
    if (ano === anoAtual || pendente) return
    iniciar(async () => {
      await trocarTemporada(ano)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm uppercase tracking-widest text-white/50 font-display">
        Temporada
      </span>
      {temporadas.map((t) => {
        const ativo = t.ano === anoAtual
        return (
          <button
            key={t.id}
            onClick={() => selecionar(t.ano)}
            disabled={pendente}
            className={`rounded-lg px-3 py-1 text-sm font-display font-bold transition-colors disabled:opacity-50 ${
              ativo
                ? 'bg-accent text-white'
                : 'bg-surface border border-border text-white/60 hover:text-white'
            }`}
          >
            {t.ano}
          </button>
        )
      })}
    </div>
  )
}

'use client'

import { Printer } from 'lucide-react'

type Props = {
  nomeArquivo: string
}

export function BotaoImprimir({ nomeArquivo }: Props) {
  function imprimir() {
    const tituloOriginal = document.title
    // O navegador usa document.title como nome sugerido do PDF
    document.title = nomeArquivo
    window.print()
    // Restaura o título depois da impressão
    setTimeout(() => {
      document.title = tituloOriginal
    }, 500)
  }

  return (
    <button
      onClick={imprimir}
      className="inline-flex items-center gap-2 bg-surface border border-border hover:border-accent/50 text-white text-sm rounded-xl px-4 py-2 transition-colors print:hidden"
    >
      <Printer size={16} /> Imprimir lastros
    </button>
  )
}

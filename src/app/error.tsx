'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const problemaDeBanco = error.message.includes('banco de dados')

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/10">
          <AlertTriangle className="text-accent" size={22} />
        </span>

        <h1 className="font-display text-xl font-bold text-white">
          {problemaDeBanco ? 'O banco de dados não respondeu' : 'Algo deu errado'}
        </h1>

        <p className="mt-2 text-white/50 text-sm leading-relaxed">
          {problemaDeBanco
            ? 'O site está no ar, mas não conseguiu buscar os dados. Isso costuma ser passageiro — tente de novo em alguns instantes.'
            : 'Não foi possível carregar esta página. Tente de novo.'}
        </p>

        <button
          onClick={reset}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          <RefreshCw size={15} /> Tentar de novo
        </button>

        {error.digest && (
          <p className="mt-4 text-white/25 text-[11px]">Código: {error.digest}</p>
        )}
      </div>
    </main>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react'

type Foto = { id: string; url: string; titulo: string | null }

export function Galeria({ fotos }: { fotos: Foto[] }) {
  const [aberta, setAberta] = useState<number | null>(null)

  const fechar = useCallback(() => setAberta(null), [])
  const anterior = useCallback(
    () => setAberta((i) => (i === null ? null : (i - 1 + fotos.length) % fotos.length)),
    [fotos.length]
  )
  const proxima = useCallback(
    () => setAberta((i) => (i === null ? null : (i + 1) % fotos.length)),
    [fotos.length]
  )

  useEffect(() => {
    if (aberta === null) return
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar()
      if (e.key === 'ArrowLeft') anterior()
      if (e.key === 'ArrowRight') proxima()
    }
    document.addEventListener('keydown', aoTeclar)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = ''
    }
  }, [aberta, fechar, anterior, proxima])

  if (fotos.length === 0) return null

  return (
    <div className="print:hidden mb-10">
      <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-3 flex items-center gap-2">
        <Camera size={15} /> Fotos ({fotos.length})
      </h2>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
        {fotos.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setAberta(i)}
            className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface transition-all hover:border-accent/60 hover:brightness-110"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.url} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {aberta !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={fechar}
        >
          <button
            onClick={fechar}
            aria-label="Fechar"
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          <span className="absolute top-6 left-1/2 -translate-x-1/2 text-white/50 text-sm num-tab">
            {aberta + 1} de {fotos.length}
          </span>

          {fotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                anterior()
              }}
              aria-label="Foto anterior"
              className="absolute left-2 md:left-6 z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotos[aberta].url}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[92vw] object-contain rounded-lg"
          />

          {fotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                proxima()
              }}
              aria-label="Próxima foto"
              className="absolute right-2 md:right-6 z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

'use client'

import { useRef, useState } from 'react'
import { Trash2, Link2, Upload, Video, Image as Icone } from 'lucide-react'

type Midia = {
  id: string
  tipo: string
  url: string
  titulo: string | null
}

type Props = {
  etapaId: string
  midia: Midia[]
  adicionarVideo: (formData: FormData) => Promise<void>
  enviarFotos: (formData: FormData) => Promise<void>
  excluirMidia: (id: string) => Promise<void>
}

const LADO_MAX = 1600
const QUALIDADE = 0.82

async function comprimir(arquivo: File): Promise<File> {
  if (!arquivo.type.startsWith('image/')) return arquivo
  try {
    const bitmap = await createImageBitmap(arquivo)
    const maior = Math.max(bitmap.width, bitmap.height)
    const escala = Math.min(1, LADO_MAX / maior)

    if (escala === 1 && arquivo.size < 900_000) return arquivo

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * escala)
    canvas.height = Math.round(bitmap.height * escala)
    const ctx = canvas.getContext('2d')
    if (!ctx) return arquivo
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const blob: Blob | null = await new Promise((resolver) =>
      canvas.toBlob((b) => resolver(b), 'image/jpeg', QUALIDADE)
    )
    if (!blob) return arquivo

    const nome = arquivo.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], nome, { type: 'image/jpeg' })
  } catch {
    return arquivo
  }
}

const input =
  'w-full bg-bg border border-border rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-accent transition-colors'
const label = 'text-white/60 text-xs block mb-1'

export function GestaoMidia({
  etapaId,
  midia,
  adicionarVideo,
  enviarFotos,
  excluirMidia,
}: Props) {
  const formVideo = useRef<HTMLFormElement>(null)
  const inputFotos = useRef<HTMLInputElement>(null)
  const [salvandoVideo, setSalvandoVideo] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [progresso, setProgresso] = useState('')

  const videos = midia.filter((m) => m.tipo === 'video')
  const fotos = midia.filter((m) => m.tipo === 'foto')

  async function acaoVideo(formData: FormData) {
    setSalvandoVideo(true)
    await adicionarVideo(formData)
    setSalvandoVideo(false)
    formVideo.current?.reset()
  }

  async function aoEnviarFotos(e: React.FormEvent) {
    e.preventDefault()
    const arquivos = Array.from(inputFotos.current?.files ?? [])
    if (arquivos.length === 0) return

    setEnviando(true)
    let originais = 0
    let finais = 0

    try {
      for (let i = 0; i < arquivos.length; i++) {
        setProgresso(`Preparando ${i + 1} de ${arquivos.length}...`)
        const original = arquivos[i]
        const reduzido = await comprimir(original)
        originais += original.size
        finais += reduzido.size

        const dados = new FormData()
        dados.set('etapa_id', etapaId)
        dados.append('fotos', reduzido)

        setProgresso(`Enviando ${i + 1} de ${arquivos.length}...`)
        await enviarFotos(dados)
      }

      const economia = originais > 0 ? Math.round((1 - finais / originais) * 100) : 0
      setProgresso(
        economia > 5
          ? `${arquivos.length} foto(s) enviada(s), ${economia}% mais leves.`
          : `${arquivos.length} foto(s) enviada(s).`
      )
      if (inputFotos.current) inputFotos.current.value = ''
    } catch (erro) {
      setProgresso(`Falhou: ${erro instanceof Error ? erro.message : 'erro no envio'}`)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="flex flex-col gap-6">
        <section className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-4">
            Adicionar vídeo
          </h2>
          <form ref={formVideo} action={acaoVideo} className="flex flex-col gap-3">
            <input type="hidden" name="etapa_id" value={etapaId} />
            <div>
              <label className={label}>Link do vídeo *</label>
              <input name="url" type="url" required className={input} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            <div>
              <label className={label}>Título (opcional)</label>
              <input name="titulo" className={input} placeholder="Melhores momentos" />
            </div>
            <button
              type="submit"
              disabled={salvandoVideo}
              className="mt-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 transition-colors"
            >
              <Link2 size={16} />
              {salvandoVideo ? 'Salvando...' : 'Adicionar vídeo'}
            </button>
          </form>
        </section>

        <section className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-4">
            Enviar fotos
          </h2>
          <form onSubmit={aoEnviarFotos} className="flex flex-col gap-3">
            <input
              ref={inputFotos}
              type="file"
              accept="image/*"
              multiple
              required
              className="text-white/60 text-sm file:mr-3 file:rounded-lg file:border file:border-border file:bg-bg file:px-3 file:py-2 file:text-white/70 file:text-sm"
            />
            <p className="text-white/30 text-[11px]">
              As fotos são reduzidas para 1600 px no seu navegador antes de subir. Pode selecionar várias de uma vez.
            </p>
            {progresso && (
              <p className={`text-sm ${progresso.startsWith('Falhou') ? 'text-red-400' : 'text-emerald-400'}`}>
                {progresso}
              </p>
            )}
            <button
              type="submit"
              disabled={enviando}
              className="mt-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 transition-colors"
            >
              <Upload size={16} />
              {enviando ? 'Enviando...' : 'Enviar fotos'}
            </button>
          </form>
        </section>
      </div>

      <div className="flex flex-col gap-6">
        <section className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-4">
            Vídeos ({videos.length})
          </h2>
          <div className="flex flex-col gap-2">
            {videos.map((v) => (
              <div key={v.id} className="flex items-center gap-3 rounded-xl border border-border bg-bg px-3 py-2.5">
                <Video className="text-accent shrink-0" size={16} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{v.titulo ?? 'Vídeo'}</p>
                  <p className="text-white/35 text-xs truncate">{v.url}</p>
                </div>
                <form action={excluirMidia.bind(null, v.id)}>
                  <button type="submit" title="Remover" className="text-white/40 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            ))}
            {videos.length === 0 && <p className="text-white/40 text-sm">Nenhum vídeo ainda.</p>}
          </div>
        </section>

        <section className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-4">
            Fotos ({fotos.length})
          </h2>
          {fotos.length === 0 ? (
            <p className="text-white/40 text-sm flex items-center gap-2">
              <Icone size={16} /> Nenhuma foto ainda.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {fotos.map((f) => (
                <div key={f.id} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-bg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt="" className="h-full w-full object-cover" />
                  <form action={excluirMidia.bind(null, f.id)} className="absolute top-1 right-1">
                    <button type="submit" title="Remover" className="rounded-lg bg-black/70 p-1.5 text-white/70 hover:text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

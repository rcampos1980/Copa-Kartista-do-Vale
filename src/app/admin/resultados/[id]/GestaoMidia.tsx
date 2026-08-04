'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adicionarLink, uploadFoto, removerMidia } from './midiaActions'
import { Video, Image as ImageIcon, X, Upload, Link as LinkIcon } from 'lucide-react'

type Midia = {
  id: string
  tipo: string
  url: string
  titulo: string | null
}

type Props = {
  etapaId: string
  midias: Midia[]
}

function ItemVideo({ midia, onRemover }: { midia: Midia; onRemover: (id: string) => void }) {
  const texto = midia.titulo ? midia.titulo : midia.url
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-bg px-3 py-2">
      <Video size={16} className="text-accent shrink-0" />
      <a href={midia.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-white/70 text-sm truncate hover:text-white">
        {texto}
      </a>
      <button onClick={() => onRemover(midia.id)} className="text-white/30 hover:text-accent p-1 shrink-0">
        <X size={16} />
      </button>
    </div>
  )
}

function ItemFoto({ midia, onRemover }: { midia: Midia; onRemover: (id: string) => void }) {
  return (
    <div className="relative group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={midia.url} alt="" className="w-full h-24 object-cover rounded-lg border border-border" />
      <button onClick={() => onRemover(midia.id)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <X size={14} />
      </button>
    </div>
  )
}

export function GestaoMidia({ etapaId, midias }: Props) {
  const router = useRouter()
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitulo, setLinkTitulo] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function addLink() {
    if (!linkUrl) return
    setEnviando(true)
    await adicionarLink(etapaId, 'video', linkUrl, linkTitulo)
    setLinkUrl('')
    setLinkTitulo('')
    setEnviando(false)
    router.refresh()
  }

  async function enviarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return
    setEnviando(true)
    const fd = new FormData()
    for (const file of Array.from(e.target.files)) {
      fd.append('foto', file)
    }
    await uploadFoto(etapaId, fd)
    setEnviando(false)
    e.target.value = ''
    router.refresh()
  }

  async function remover(midiaId: string) {
    await removerMidia(midiaId, etapaId)
    router.refresh()
  }

  const input =
    'bg-bg border border-border rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-accent transition-colors'

  const videos = midias.filter((m) => m.tipo === 'video')
  const fotos = midias.filter((m) => m.tipo === 'foto')

  return (
    <section className="bg-surface border border-border rounded-2xl p-6 mt-6">
      <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-4">
        Fotos e videos da etapa
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <label className="text-white/60 text-xs flex items-center gap-1.5">
            <Video size={14} /> Link de video (YouTube, etc.)
          </label>
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className={`w-full ${input}`}
            placeholder="https://youtube.com/..."
          />
          <input
            value={linkTitulo}
            onChange={(e) => setLinkTitulo(e.target.value)}
            className={`w-full ${input}`}
            placeholder="Titulo (opcional)"
          />
          <button
            onClick={addLink}
            disabled={enviando}
            className="bg-bg border border-border hover:border-accent/50 text-white text-sm rounded-xl px-4 py-2 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <LinkIcon size={16} /> Adicionar link
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-white/60 text-xs flex items-center gap-1.5">
            <ImageIcon size={14} /> Enviar foto(s)
          </label>
          <label className="flex-1 flex flex-col items-center justify-center gap-2 border border-dashed border-border rounded-xl py-6 cursor-pointer hover:border-accent/50 transition-colors">
            <Upload size={20} className="text-white/40" />
            <span className="text-white/50 text-xs">
              {enviando ? 'Enviando...' : 'Clique para escolher uma ou mais fotos'}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={enviarFoto}
              disabled={enviando}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {videos.length > 0 && (
        <div className="mb-4">
          <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Videos</p>
          <div className="flex flex-col gap-2">
            {videos.map((m) => (
              <ItemVideo key={m.id} midia={m} onRemover={remover} />
            ))}
          </div>
        </div>
      )}

      {fotos.length > 0 && (
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Fotos</p>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {fotos.map((m) => (
              <ItemFoto key={m.id} midia={m} onRemover={remover} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

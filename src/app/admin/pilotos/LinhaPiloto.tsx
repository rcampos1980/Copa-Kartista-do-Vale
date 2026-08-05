'use client'

import { useState } from 'react'
import { User, Eye, EyeOff, Pencil, Send, ShieldCheck } from 'lucide-react'

type Piloto = {
  id: string
  nome: string
  numero_kart: number | null
  cidade: string | null
  ativo: boolean
  foto_url?: string | null
  tipo?: string | null
  email?: string | null
  is_admin?: boolean
}

type Resultado = { ok: boolean; mensagem: string }

type Props = {
  piloto: Piloto
  alternarAtivo: (id: string, ativo: boolean) => Promise<void>
  onEditar: (id: string) => void
  reenviarAcesso: (pilotoId: string) => Promise<Resultado>
}

export function LinhaPiloto({ piloto, alternarAtivo, onEditar, reenviarAcesso }: Props) {
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<Resultado | null>(null)

  async function reenviar() {
    setEnviando(true)
    setAviso(null)
    const r = await reenviarAcesso(piloto.id)
    setEnviando(false)
    setAviso(r)
  }

  return (
    <div
      className={`rounded-xl border border-border px-3 py-2.5 ${
        piloto.ativo ? 'bg-bg' : 'bg-bg/40 opacity-60'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-surface border border-border overflow-hidden flex items-center justify-center shrink-0">
          {piloto.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={piloto.foto_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="text-white/40" size={18} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {piloto.nome}
            {piloto.numero_kart != null && (
              <span className="text-white/40"> · #{piloto.numero_kart}</span>
            )}
            {piloto.is_admin && (
              <ShieldCheck className="inline-block ml-1.5 text-accent align-[-2px]" size={13} />
            )}
          </p>
          <p className="text-white/40 text-xs truncate">
            {piloto.email ?? piloto.cidade ?? 'Sem cidade'}
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${
            piloto.ativo ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/10 text-white/40'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${piloto.ativo ? 'bg-emerald-400' : 'bg-white/40'}`} />
          {piloto.ativo ? 'Ativo' : 'Inativo'}
        </span>

        {piloto.tipo && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${
              piloto.tipo === 'convidado'
                ? 'bg-sky-500/15 text-sky-400'
                : 'bg-purple-500/15 text-purple-300'
            }`}
          >
            {piloto.tipo === 'convidado' ? 'Convidado' : 'Fixo'}
          </span>
        )}

        {piloto.email && (
          <button
            onClick={reenviar}
            disabled={enviando}
            className="text-white/40 hover:text-accent disabled:opacity-40 p-2 transition-colors shrink-0"
            title="Reenviar link de acesso"
          >
            <Send size={16} />
          </button>
        )}

        <button
          onClick={() => onEditar(piloto.id)}
          className="text-white/40 hover:text-accent p-2 transition-colors shrink-0"
          title="Editar"
        >
          <Pencil size={16} />
        </button>

        <button
          onClick={() => alternarAtivo(piloto.id, piloto.ativo)}
          className="text-white/40 hover:text-white p-2 transition-colors shrink-0"
          title={piloto.ativo ? 'Desativar' : 'Ativar'}
        >
          {piloto.ativo ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>

      {enviando && <p className="mt-2 text-white/50 text-xs">Enviando...</p>}

      {aviso && (
        <p className={`mt-2 text-xs ${aviso.ok ? 'text-emerald-400' : 'text-red-400'}`}>
          {aviso.mensagem}
        </p>
      )}
    </div>
  )
}

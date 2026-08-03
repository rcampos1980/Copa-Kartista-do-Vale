'use client'

import { User, Eye, EyeOff } from 'lucide-react'

type Piloto = {
  id: string
  nome: string
  numero_kart: number | null
  cidade: string | null
  ativo: boolean
}

type Props = {
  piloto: Piloto
  alternarAtivo: (id: string, ativo: boolean) => Promise<void>
}

export function LinhaPiloto({ piloto, alternarAtivo }: Props) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 ${
        piloto.ativo ? 'bg-bg' : 'bg-bg/40 opacity-60'
      }`}
    >
      <div className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
        <User className="text-white/40" size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">
          {piloto.nome}
          {piloto.numero_kart != null && (
            <span className="text-white/40"> · #{piloto.numero_kart}</span>
          )}
        </p>
        <p className="text-white/40 text-xs truncate">
          {piloto.cidade ?? 'Sem cidade'}
        </p>
      </div>
      <button
        onClick={() => alternarAtivo(piloto.id, piloto.ativo)}
        className="text-white/40 hover:text-white p-2 transition-colors shrink-0"
        title={piloto.ativo ? 'Desativar' : 'Ativar'}
      >
        {piloto.ativo ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  )
}

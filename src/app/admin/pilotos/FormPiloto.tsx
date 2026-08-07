'use client'

import { useRef, useState, useEffect } from 'react'
import { User, Upload, ShieldCheck } from 'lucide-react'

type PilotoEditando = {
  id: string
  nome: string
  numero_kart: number | null
  idade: number | null
  cidade: string | null
  telefone: string | null
  categoria: string | null
  estilo_pilotagem: string | null
  caracteristicas: string | null
  peso?: number | null
  tipo?: string | null
  foto_url?: string | null
  ativo?: boolean
  email?: string | null
  is_admin?: boolean
} | null

type Resultado = { ok: boolean; mensagem: string }

type Props = {
  salvarPiloto: (formData: FormData) => Promise<Resultado>
  pilotoEditando?: PilotoEditando
  onSalvo?: () => void
}

export function FormPiloto({ salvarPiloto, pilotoEditando, onSalvo }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [salvando, setSalvando] = useState(false)
  const [fotoAtual, setFotoAtual] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [ativo, setAtivo] = useState(true)
  const [ehAdmin, setEhAdmin] = useState(false)
  const [aviso, setAviso] = useState<Resultado | null>(null)

  useEffect(() => {
    setAviso(null)
    const f = formRef.current
    if (!f) return

    if (pilotoEditando) {
      const campo = (nome: string) => f.elements.namedItem(nome) as HTMLInputElement | null
      const set = (nome: string, valor: string) => {
        const el = campo(nome)
        if (el) el.value = valor
      }
      set('nome', pilotoEditando.nome ?? '')
      set('numero_kart', pilotoEditando.numero_kart?.toString() ?? '')
      set('idade', pilotoEditando.idade?.toString() ?? '')
      set('cidade', pilotoEditando.cidade ?? '')
      set('telefone', pilotoEditando.telefone ?? '')
      set('categoria', pilotoEditando.categoria ?? '')
      set('estilo_pilotagem', pilotoEditando.estilo_pilotagem ?? '')
      set('caracteristicas', pilotoEditando.caracteristicas ?? '')
      set('peso', pilotoEditando.peso != null ? String(pilotoEditando.peso) : '')
      set('tipo', pilotoEditando.tipo ?? '')
      set('email', pilotoEditando.email ?? '')
      setFotoAtual(pilotoEditando.foto_url ?? null)
      setPreview(null)
      setAtivo(pilotoEditando.ativo ?? true)
      setEhAdmin(pilotoEditando.is_admin ?? false)
    } else {
      f.reset()
      setFotoAtual(null)
      setPreview(null)
      setAtivo(true)
      setEhAdmin(false)
    }
  }, [pilotoEditando])

  function aoEscolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  async function acao(formData: FormData) {
    setSalvando(true)
    setAviso(null)
    if (pilotoEditando) formData.set('id', pilotoEditando.id)
    const resultado = await salvarPiloto(formData)
    setSalvando(false)
    setAviso(resultado)
    if (!resultado.ok) return
    onSalvo?.()
  }

  const input =
    'w-full bg-bg border border-border rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-accent transition-colors'
  const label = 'text-white/60 text-xs block mb-1'
  const imagem = preview ?? fotoAtual

  return (
    <form ref={formRef} action={acao} className="flex flex-col gap-3">
      <input type="hidden" name="ativo" value={ativo ? 'true' : 'false'} />
      <input type="hidden" name="is_admin" value={ehAdmin ? 'true' : 'false'} />

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-bg border border-border overflow-hidden flex items-center justify-center shrink-0">
          {imagem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagem} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="text-white/30" size={28} />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm text-white/70 border border-border hover:border-accent/50 rounded-xl px-3 py-2 cursor-pointer transition-colors w-fit">
            <Upload size={16} /> Escolher foto
            <input name="foto" type="file" accept="image/*" onChange={aoEscolherFoto} className="hidden" />
          </label>
          <button
            type="button"
            onClick={() => setAtivo((v) => !v)}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors w-fit ${
              ativo
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-white/40 border border-border'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${ativo ? 'bg-emerald-400' : 'bg-white/30'}`} />
            {ativo ? 'Ativo' : 'Inativo'}
          </button>
        </div>
      </div>

      <div>
        <label className={label}>Nome *</label>
        <input name="nome" required className={input} placeholder="Nome do piloto" />
      </div>

      <div className="rounded-xl border border-border bg-bg/50 p-3 flex flex-col gap-3">
        <p className="text-white/40 text-[10px] uppercase tracking-widest">Acesso ao site</p>
        <div>
          <label className={label}>E-mail de login</label>
          <input name="email" type="email" autoComplete="off" className={input} placeholder="piloto@email.com" />
          <p className="mt-1 text-white/30 text-[11px]">
            Ao salvar com um e-mail novo, a conta é criada e um código de acesso é enviado. Em branco, o piloto não tem acesso.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEhAdmin((v) => !v)}
          className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors w-fit ${
            ehAdmin
              ? 'bg-accent/15 text-accent border border-accent/40'
              : 'bg-white/5 text-white/40 border border-border'
          }`}
        >
          <ShieldCheck size={16} />
          {ehAdmin ? 'É administrador' : 'Não é administrador'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Número do kart</label>
          <input name="numero_kart" type="number" className={input} placeholder="7" />
        </div>
        <div>
          <label className={label}>Idade</label>
          <input name="idade" type="number" className={input} placeholder="35" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Peso (kg) *</label>
          <input name="peso" type="number" step="0.1" required className={input} placeholder="78" />
        </div>
        <div>
          <label className={label}>Tipo *</label>
          <select name="tipo" required defaultValue="" className={input}>
            <option value="" disabled>Selecione...</option>
            <option value="fixo">Fixo</option>
            <option value="convidado">Convidado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Cidade</label>
          <input name="cidade" className={input} placeholder="São Paulo" />
        </div>
        <div>
          <label className={label}>Telefone</label>
          <input name="telefone" className={input} placeholder="(11) 99999-9999" />
        </div>
      </div>

      <div>
        <label className={label}>Categoria</label>
        <input name="categoria" className={input} placeholder="Elite" />
      </div>

      <div>
        <label className={label}>Estilo de pilotagem</label>
        <input name="estilo_pilotagem" className={input} placeholder="Agressivo nas curvas" />
      </div>

      <div>
        <label className={label}>Características / observações</label>
        <textarea name="caracteristicas" rows={2} className={input} placeholder="Notas sobre o piloto" />
      </div>

      {aviso && (
        <p
          className={`rounded-xl border px-3 py-2.5 text-sm ${
            aviso.ok
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/40 bg-red-500/10 text-red-300'
          }`}
        >
          {aviso.mensagem}
        </p>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="mt-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 transition-colors"
      >
        {salvando ? 'Salvando...' : pilotoEditando ? 'Salvar alterações' : 'Cadastrar piloto'}
      </button>
    </form>
  )
}

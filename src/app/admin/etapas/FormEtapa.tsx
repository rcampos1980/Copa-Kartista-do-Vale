'use client'

import { useRef, useState, useEffect } from 'react'

type EtapaEditando = {
  id: string
  nome: string | null
  pista: string
  data: string
  status: string
  observacoes?: string | null
} | null

type Props = {
  salvarEtapa: (formData: FormData) => Promise<void>
  etapaEditando?: EtapaEditando
  onSalvo?: () => void
  onCancelar?: () => void
}

export function FormEtapa({ salvarEtapa, etapaEditando, onSalvo, onCancelar }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (etapaEditando && formRef.current) {
      const f = formRef.current
      ;(f.elements.namedItem('nome') as HTMLInputElement).value = etapaEditando.nome ?? ''
      ;(f.elements.namedItem('pista') as HTMLInputElement).value = etapaEditando.pista ?? ''
      ;(f.elements.namedItem('data') as HTMLInputElement).value = String(etapaEditando.data).split('T')[0]
      ;(f.elements.namedItem('status') as HTMLSelectElement).value = etapaEditando.status ?? 'agendada'
      ;(f.elements.namedItem('observacoes') as HTMLTextAreaElement).value =
        etapaEditando.observacoes ?? ''
    } else if (!etapaEditando && formRef.current) {
      formRef.current.reset()
    }
  }, [etapaEditando])

  async function acao(formData: FormData) {
    setSalvando(true)
    if (etapaEditando) formData.set('id', etapaEditando.id)
    await salvarEtapa(formData)
    setSalvando(false)
    formRef.current?.reset()
    onSalvo?.()
  }

  const input =
    'w-full bg-bg border border-border rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-accent transition-colors'
  const label = 'text-white/60 text-xs block mb-1'

  return (
    <form ref={formRef} action={acao} className="flex flex-col gap-3">
      <div>
        <label className={label}>Nome da etapa</label>
        <input name="nome" className={input} placeholder="Etapa 1" />
      </div>

      <div>
        <label className={label}>Pista / Kartódromo *</label>
        <input name="pista" required className={input} placeholder="Kartódromo Granja Viana" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Data *</label>
          <input name="data" type="date" required className={input} />
        </div>
        <div>
          <label className={label}>Status</label>
          <select name="status" className={input} defaultValue="agendada">
            <option value="agendada">Agendada</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Observações</label>
        <textarea name="observacoes" rows={2} className={input} placeholder="Notas sobre a etapa" />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={salvando}
          className="flex-1 mt-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 transition-colors"
        >
          {salvando ? 'Salvando...' : etapaEditando ? 'Salvar alterações' : 'Cadastrar etapa'}
        </button>
        {etapaEditando && (
          <button
            type="button"
            onClick={onCancelar}
            className="mt-1 border border-border text-white/60 hover:text-white rounded-xl px-4 py-2.5 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

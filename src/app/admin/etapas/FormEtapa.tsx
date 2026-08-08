'use client'

import { useRef, useState, useEffect } from 'react'

type EtapaEditando = {
  id: string
  nome: string | null
  pista: string
  data: string
  horario?: string | null
  status: string
  observacoes?: string | null
  link_mapa?: string | null
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
    const f = formRef.current
    if (!f) return

    if (etapaEditando) {
      const set = (nome: string, valor: string) => {
        const el = f.elements.namedItem(nome) as HTMLInputElement | null
        if (el) el.value = valor
      }
      set('nome', etapaEditando.nome ?? '')
      set('pista', etapaEditando.pista ?? '')
      set('data', String(etapaEditando.data).split('T')[0])
      set('horario', etapaEditando.horario ? String(etapaEditando.horario).slice(0, 5) : '')
      set('status', etapaEditando.status ?? 'agendada')
      set('observacoes', etapaEditando.observacoes ?? '')
      set('link_mapa', etapaEditando.link_mapa ?? '')
    } else {
      f.reset()
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
          <label className={label}>Horário</label>
          <input name="horario" type="time" className={input} />
        </div>
      </div>

      <div>
        <label className={label}>Status</label>
        <select name="status" className={input} defaultValue="agendada">
          <option value="agendada">Agendada</option>
          <option value="realizada">Realizada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <div>
        <label className={label}>Link do mapa (Google Maps)</label>
        <input name="link_mapa" type="url" className={input} placeholder="https://maps.app.goo.gl/..." />
        <p className="text-white/30 text-[11px] mt-1">
          No Google Maps, procure o kartódromo, toque em Compartilhar e cole o link aqui. Vira o
          botão “Como chegar” na página da etapa.
        </p>
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

'use client'

import { useRef, useState } from 'react'

type Props = {
  salvarPiloto: (formData: FormData) => Promise<void>
}

export function FormPiloto({ salvarPiloto }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [salvando, setSalvando] = useState(false)

  async function acao(formData: FormData) {
    setSalvando(true)
    await salvarPiloto(formData)
    setSalvando(false)
    formRef.current?.reset()
  }

  const input =
    'w-full bg-bg border border-border rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-accent transition-colors'
  const label = 'text-white/60 text-xs block mb-1'

  return (
    <form ref={formRef} action={acao} className="flex flex-col gap-3">
      <div>
        <label className={label}>Nome *</label>
        <input name="nome" required className={input} placeholder="Nome do piloto" />
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

      <button
        type="submit"
        disabled={salvando}
        className="mt-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 transition-colors"
      >
        {salvando ? 'Salvando...' : 'Cadastrar piloto'}
      </button>
    </form>
  )
}

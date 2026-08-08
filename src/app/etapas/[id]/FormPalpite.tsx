'use client'

import { useState } from 'react'
import { Dices, Trophy } from 'lucide-react'

type Piloto = { id: string; nome: string }
type Palpite = { primeiro: string; segundo: string; terceiro: string } | null
type Resultado = { ok: boolean; mensagem: string }

const CORES = ['text-gold', 'text-silver', 'text-bronze']
const NOMES = ['1º lugar', '2º lugar', '3º lugar']
const CAMPOS = ['primeiro', 'segundo', 'terceiro'] as const

export function FormPalpite({
  etapaId,
  pilotos,
  palpiteAtual,
  salvarPalpite,
}: {
  etapaId: string
  pilotos: Piloto[]
  palpiteAtual: Palpite
  salvarPalpite: (formData: FormData) => Promise<Resultado>
}) {
  const [aviso, setAviso] = useState<Resultado | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [escolhas, setEscolhas] = useState<string[]>([
    palpiteAtual?.primeiro ?? '',
    palpiteAtual?.segundo ?? '',
    palpiteAtual?.terceiro ?? '',
  ])

  async function enviar(formData: FormData) {
    setSalvando(true)
    setAviso(null)
    const r = await salvarPalpite(formData)
    setSalvando(false)
    setAviso(r)
  }

  function trocar(i: number, valor: string) {
    setEscolhas((atual) => atual.map((v, j) => (j === i ? valor : v)))
  }

  return (
    <section className="mb-6 rounded-2xl border border-accent/30 bg-surface p-5 print:hidden">
      <div className="flex items-center gap-2 mb-1">
        <Dices className="text-accent" size={17} />
        <h2 className="font-display font-bold text-white text-lg">Bolão do pódio</h2>
      </div>
      <p className="text-white/40 text-sm mb-4">
        {palpiteAtual
          ? 'Seu palpite está registrado. Dá para mudar até o dia da corrida.'
          : 'Chute quem sobe no pódio. Acertar a posição exata vale 5 pontos, acertar só o piloto vale 2.'}
      </p>

      <form action={enviar} className="flex flex-col gap-3">
        <input type="hidden" name="etapa_id" value={etapaId} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {CAMPOS.map((campo, i) => (
            <div key={campo}>
              <label className="flex items-center gap-1.5 text-xs mb-1">
                <Trophy className={CORES[i]} size={13} />
                <span className="text-white/50">{NOMES[i]}</span>
              </label>
              <select
                name={campo}
                required
                value={escolhas[i]}
                onChange={(e) => trocar(i, e.target.value)}
                className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-accent transition-colors"
              >
                <option value="">Escolher...</option>
                {pilotos
                  .filter((p) => !escolhas.some((v, j) => j !== i && v === p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
              </select>
            </div>
          ))}
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
          className="mt-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 text-sm transition-colors w-fit"
        >
          {salvando ? 'Salvando...' : palpiteAtual ? 'Atualizar palpite' : 'Registrar palpite'}
        </button>
      </form>
    </section>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { salvarPontuacao } from './pontuacaoActions'
import { Save, Zap } from 'lucide-react'

type Regra = { posicao: number; pontos: number }

type Props = {
  campeonatoId: string
  bonusInicial: number
  regrasIniciais: Regra[]
}

export function PontuacaoEditor({ campeonatoId, bonusInicial, regrasIniciais }: Props) {
  const router = useRouter()

  function montarGrade(): Regra[] {
    return Array.from({ length: 30 }, (_, i) => {
      const posicao = i + 1
      const salvo = regrasIniciais.find((r) => r.posicao === posicao)
      return { posicao, pontos: salvo ? salvo.pontos : Math.max(16 - posicao, 0) }
    })
  }

  const [regras, setRegras] = useState<Regra[]>(montarGrade)
  const [bonus, setBonus] = useState<number>(regrasIniciais.length > 0 ? bonusInicial : 2)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')

  function setPontos(posicao: number, valor: string) {
    const n = valor === '' ? 0 : Number(valor.replace(/[^0-9]/g, ''))
    setRegras((prev) => prev.map((r) => (r.posicao === posicao ? { ...r, pontos: n } : r)))
  }

  function setBonusVal(valor: string) {
    setBonus(valor === '' ? 0 : Number(valor.replace(/[^0-9]/g, '')))
  }

  async function salvar() {
    setSalvando(true)
    setMsg('')
    await salvarPontuacao(campeonatoId, bonus, regras)
    setSalvando(false)
    setMsg('Pontuação salva com sucesso!')
    router.refresh()
  }

  if (!campeonatoId) {
    return (
      <p className="text-white/50 text-sm">
        Nenhum campeonato encontrado. Crie um campeonato primeiro.
      </p>
    )
  }

  return (
    <div className="max-w-3xl">
      <section className="bg-surface border border-border rounded-2xl p-5 mb-4">
        <label className="text-white/60 text-xs flex items-center gap-1.5 mb-2">
          <Zap size={14} className="text-gold" /> Bônus por melhor volta (pontos)
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={String(bonus)}
          onChange={(e) => setBonusVal(e.target.value)}
          className="w-24 text-center bg-bg border border-border rounded-lg px-2 py-1.5 text-white font-display font-bold text-lg outline-none focus:border-accent transition-colors"
        />
      </section>

      <section className="bg-surface border border-border rounded-2xl p-5">
        <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-1">
          Pontos por posição
        </h2>
        <p className="text-white/40 text-xs mb-4">
          Defina quantos pontos cada posição vale. Deixe 0 para posições que não pontuam.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {regras.map((r) => (
            <div
              key={r.posicao}
              className="flex items-center gap-1 rounded-lg border border-border bg-bg px-2 py-1"
            >
              <span className="w-7 text-white/50 text-xs font-display font-bold shrink-0">
                {r.posicao}º
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={String(r.pontos)}
                onChange={(e) => setPontos(r.posicao, e.target.value)}
                className="w-full text-center bg-surface border border-border rounded-md px-1 py-1 text-white text-sm font-medium outline-none focus:border-accent transition-colors"
              />
            </div>
          ))}
        </div>

        <button
          onClick={salvar}
          disabled={salvando}
          className="mt-5 w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-colors"
        >
          <Save size={18} />
          {salvando ? 'Salvando...' : 'Salvar pontuação'}
        </button>
        {msg && <p className="mt-3 text-sm text-emerald-400">{msg}</p>}
      </section>
    </div>
  )
}

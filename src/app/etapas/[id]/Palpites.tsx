import { Dices, Trophy } from 'lucide-react'

type Palpite = {
  id: string
  apelido: string
  primeiro: string
  segundo: string
  terceiro: string
  nome_primeiro: string
  nome_segundo: string
  nome_terceiro: string
}

export function pontuarPalpite(escolhas: string[], podio: string[]) {
  let total = 0
  const acertos: ('exato' | 'parcial' | 'errou')[] = []
  escolhas.forEach((id, i) => {
    if (podio[i] === id) {
      total += 5
      acertos.push('exato')
    } else if (podio.includes(id)) {
      total += 2
      acertos.push('parcial')
    } else {
      acertos.push('errou')
    }
  })
  return { total, acertos }
}

const COR = {
  exato: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  parcial: 'border-amber-500/35 bg-amber-500/10 text-amber-300',
  errou: 'border-border bg-bg text-white/40',
}

export function Palpites({ palpites, podio }: { palpites: Palpite[]; podio: string[] }) {
  if (palpites.length === 0) return null

  const comPontos = palpites
    .map((p) => {
      const escolhas = [p.primeiro, p.segundo, p.terceiro]
      const nomes = [p.nome_primeiro, p.nome_segundo, p.nome_terceiro]
      const { total, acertos } = pontuarPalpite(escolhas, podio)
      return { ...p, nomes, total, acertos }
    })
    .sort((a, b) => b.total - a.total || a.apelido.localeCompare(b.apelido, 'pt-BR'))

  return (
    <section className="mb-10 print:hidden">
      <div className="flex items-center gap-2 mb-1">
        <Dices className="text-accent" size={16} />
        <h2 className="font-display uppercase text-sm tracking-wide text-white/50">
          Bolão do pódio
        </h2>
      </div>
      <p className="text-white/30 text-xs mb-3">
        Verde: posição exata, 5 pontos. Âmbar: piloto no pódio em outra posição, 2 pontos.
      </p>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {comPontos.map((p, i) => (
          <div key={p.id} className="border-b border-border last:border-b-0 px-4 md:px-5 py-3">
            <div className="flex items-center gap-3 mb-2">
              <span className="w-5 text-right font-display font-bold text-white/25 text-sm num-tab shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 min-w-0 font-medium text-white truncate">{p.apelido}</span>
              <span className={`font-display font-bold text-lg num-tab shrink-0 ${p.total > 0 ? 'text-accent' : 'text-white/25'}`}>
                {p.total}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pl-8">
              {p.nomes.map((nome, j) => (
                <span
                  key={j}
                  className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] truncate ${COR[p.acertos[j]]}`}
                >
                  <Trophy size={10} className="shrink-0" />
                  <span className="truncate">{nome}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

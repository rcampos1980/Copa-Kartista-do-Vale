import { createClient } from '@/lib/supabase/server'
import { MenuAdmin } from '@/components/MenuAdmin'
import { Eye, Users, Smartphone, Monitor, TrendingUp } from 'lucide-react'

const NOMES: Record<string, string> = {
  '/': 'Início',
  '/classificacao': 'Classificação',
  '/pilotos': 'Pilotos',
  '/etapas': 'Etapas',
  '/estatisticas': 'Estatísticas',
  '/regulamento': 'Regulamento',
  '/login': 'Login',
  '/definir-senha': 'Definir senha',
}

function rotular(caminho: string) {
  if (NOMES[caminho]) return NOMES[caminho]
  if (caminho.startsWith('/etapas/')) return 'Detalhe de etapa'
  if (caminho.startsWith('/pilotos/')) return 'Perfil de piloto'
  return caminho
}

export default async function AdminVisitasPage() {
  const supabase = await createClient()

  const desde = new Date()
  desde.setDate(desde.getDate() - 29)
  desde.setHours(0, 0, 0, 0)

  const { data: visitas } = await supabase
    .from('visitas')
    .select('caminho, sessao, dispositivo, referencia, criado_em')
    .gte('criado_em', desde.toISOString())
    .order('criado_em', { ascending: false })

  const linhas = visitas ?? []

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const seteDias = new Date(hoje)
  seteDias.setDate(seteDias.getDate() - 6)

  const emOuDepois = (iso: string, limite: Date) => new Date(iso) >= limite

  const totalHoje = linhas.filter((v) => emOuDepois(v.criado_em, hoje)).length
  const total7 = linhas.filter((v) => emOuDepois(v.criado_em, seteDias)).length
  const total30 = linhas.length
  const unicos30 = new Set(linhas.map((v) => v.sessao).filter(Boolean)).size

  const celular = linhas.filter((v) => v.dispositivo === 'celular').length
  const percCelular = total30 ? Math.round((celular / total30) * 100) : 0

  const porDia = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(hoje)
    d.setDate(d.getDate() - i)
    porDia.set(d.toISOString().slice(0, 10), 0)
  }
  for (const v of linhas) {
    const chave = new Date(v.criado_em).toISOString().slice(0, 10)
    if (porDia.has(chave)) porDia.set(chave, (porDia.get(chave) ?? 0) + 1)
  }
  const dias = [...porDia.entries()]
  const maxDia = Math.max(1, ...dias.map(([, n]) => n))

  const porPagina = new Map<string, number>()
  for (const v of linhas) {
    const r = rotular(v.caminho)
    porPagina.set(r, (porPagina.get(r) ?? 0) + 1)
  }
  const paginas = [...porPagina.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  const maxPagina = Math.max(1, ...paginas.map(([, n]) => n))

  const cards = [
    { icone: Eye, rotulo: 'Hoje', valor: totalHoje, nota: 'acessos' },
    { icone: TrendingUp, rotulo: '7 dias', valor: total7, nota: 'acessos' },
    { icone: Eye, rotulo: '30 dias', valor: total30, nota: 'acessos' },
    { icone: Users, rotulo: 'Pessoas', valor: unicos30, nota: 'diferentes em 30 dias' },
  ]

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-accent font-display">
          Administração
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          Visitas ao site
        </h1>
      </header>

      <MenuAdmin />

      {total30 === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <Eye className="text-white/20 mx-auto mb-3" size={30} />
          <p className="text-white/50 text-sm">
            Nenhuma visita registrada ainda. A contagem começa a partir de agora — páginas de
            administração não entram na conta.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-4xl">
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {cards.map((c) => {
              const Icone = c.icone
              return (
                <div key={c.rotulo} className="bg-surface border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icone className="text-white/40" size={15} />
                    <span className="text-white/40 text-[10px] uppercase tracking-widest">
                      {c.rotulo}
                    </span>
                  </div>
                  <p className="font-display font-bold text-white text-3xl leading-none num-tab">
                    {c.valor}
                  </p>
                  <p className="text-white/35 text-xs mt-1">{c.nota}</p>
                </div>
              )
            })}
          </section>

          <section className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-4">
              Últimos 30 dias
            </h2>
            <div className="flex items-end gap-[3px] h-32">
              {dias.map(([dia, n]) => (
                <div key={dia} className="flex-1 flex flex-col justify-end group relative">
                  <div
                    className="w-full rounded-t bg-accent/60 group-hover:bg-accent transition-colors min-h-[2px]"
                    style={{ height: `${(n / maxDia) * 100}%` }}
                    title={`${dia.split('-').reverse().join('/')} · ${n} acessos`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-white/25 text-[10px]">
              <span>{dias[0]?.[0].split('-').reverse().slice(0, 2).join('/')}</span>
              <span>hoje</span>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-2xl p-5">
              <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-4">
                Páginas mais vistas
              </h2>
              <div className="flex flex-col gap-2.5">
                {paginas.map(([nome, n]) => (
                  <div key={nome} className="relative">
                    <div
                      className="absolute inset-y-0 left-0 rounded bg-accent/10"
                      style={{ width: `${(n / maxPagina) * 100}%` }}
                    />
                    <div className="relative flex items-center justify-between px-2 py-1.5">
                      <span className="text-white/80 text-sm truncate">{nome}</span>
                      <span className="text-white font-display font-bold text-sm num-tab shrink-0 ml-2">
                        {n}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-5">
              <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-4">
                Como acessam
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="text-accent shrink-0" size={18} />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-white/70 text-sm">Celular</span>
                      <span className="font-display font-bold text-white num-tab">
                        {percCelular}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${percCelular}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Monitor className="text-white/50 shrink-0" size={18} />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-white/70 text-sm">Computador</span>
                      <span className="font-display font-bold text-white num-tab">
                        {100 - percCelular}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg overflow-hidden">
                      <div className="h-full bg-white/40" style={{ width: `${100 - percCelular}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export const dynamic = 'force-dynamic'

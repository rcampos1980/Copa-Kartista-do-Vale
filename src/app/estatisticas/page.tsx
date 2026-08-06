import { createClient } from '@/lib/supabase/server'
import { getAnoSelecionado } from '@/lib/temporada'
import { Trophy, Medal, Zap, Target, Flag, TrendingUp } from 'lucide-react'

type Linha = {
  piloto_id: string
  nome: string
  corridas: number
  vitorias: number
  podios: number
  voltas: number
  melhorPos: number
  somaPos: number
  pontos: number
}

export default async function EstatisticasPage() {
  const supabase = await createClient()
  const ano = await getAnoSelecionado()

  const consulta = supabase.from('campeonatos').select('id, ano, nome')
  const { data: campeonato } =
    ano != null
      ? await consulta.eq('ano', ano).maybeSingle()
      : await consulta.order('ano', { ascending: false }).limit(1).maybeSingle()

  if (!campeonato) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white/60">
        Nenhum campeonato encontrado.
      </main>
    )
  }

  const { data: etapas } = await supabase
    .from('etapas')
    .select('id, nome, pista, data, status')
    .eq('campeonato_id', campeonato.id)
    .order('data', { ascending: true })

  const idsEtapas = (etapas ?? []).map((e) => e.id)

  const { data: resultados } = idsEtapas.length
    ? await supabase.from('vw_resultados_publico').select('*').in('etapa_id', idsEtapas)
    : { data: [] }

  const oficiais = (resultados ?? []).filter((r) => !r.is_convidado)

  const mapa = new Map<string, Linha>()
  for (const r of oficiais) {
    const atual = mapa.get(r.piloto_id) ?? {
      piloto_id: r.piloto_id,
      nome: r.piloto_nome ?? 'Piloto',
      corridas: 0,
      vitorias: 0,
      podios: 0,
      voltas: 0,
      melhorPos: 99,
      somaPos: 0,
      pontos: 0,
    }
    atual.corridas += 1
    atual.somaPos += r.posicao_chegada
    atual.pontos += r.pontos ?? 0
    if (r.posicao_chegada === 1) atual.vitorias += 1
    if (r.posicao_chegada <= 3) atual.podios += 1
    if (r.melhor_volta_flag) atual.voltas += 1
    if (r.posicao_chegada < atual.melhorPos) atual.melhorPos = r.posicao_chegada
    mapa.set(r.piloto_id, atual)
  }

  const linhas = [...mapa.values()].sort((a, b) => b.pontos - a.pontos)
  const etapasRealizadas = (etapas ?? []).filter((e) => e.status === 'realizada').length
  const maxPontos = linhas[0]?.pontos ?? 0

  const lider = (chave: (l: Linha) => number) =>
    linhas.length
      ? [...linhas].sort((a, b) => chave(b) - chave(a) || a.nome.localeCompare(b.nome))[0]
      : null

  const maisVitorias = lider((l) => l.vitorias)
  const maisPodios = lider((l) => l.podios)
  const maisVoltas = lider((l) => l.voltas)
  const maisRegular = linhas.length
    ? [...linhas]
        .filter((l) => l.corridas >= Math.max(1, Math.ceil(etapasRealizadas / 2)))
        .sort((a, b) => a.somaPos / a.corridas - b.somaPos / b.corridas)[0]
    : null

  const destaques = [
    { icone: Trophy, cor: 'text-gold', rotulo: 'Mais vitórias', dado: maisVitorias, valor: maisVitorias?.vitorias ?? 0, sufixo: 'vitórias' },
    { icone: Medal, cor: 'text-silver', rotulo: 'Mais pódios', dado: maisPodios, valor: maisPodios?.podios ?? 0, sufixo: 'pódios' },
    { icone: Zap, cor: 'text-accent', rotulo: 'Mais voltas rápidas', dado: maisVoltas, valor: maisVoltas?.voltas ?? 0, sufixo: 'voltas' },
    { icone: Target, cor: 'text-bronze', rotulo: 'Mais regular', dado: maisRegular, valor: maisRegular ? Number((maisRegular.somaPos / maisRegular.corridas).toFixed(1)) : 0, sufixo: 'posição média' },
  ]

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-widest text-accent font-display">
          Temporada {campeonato.ano}
        </p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
          Estatísticas
        </h1>
      </header>

      {linhas.length === 0 ? (
        <p className="text-white/50">Nenhum resultado lançado ainda nesta temporada.</p>
      ) : (
        <div className="flex flex-col gap-8">
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {destaques.map((d) => {
              const Icone = d.icone
              return (
                <div key={d.rotulo} className="bg-surface border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icone className={d.cor} size={16} />
                    <span className="text-white/40 text-[10px] uppercase tracking-widest">
                      {d.rotulo}
                    </span>
                  </div>
                  <p className="font-display font-bold text-white text-base leading-tight truncate">
                    {d.dado?.nome ?? '—'}
                  </p>
                  <p className="mt-1 font-display font-bold text-accent text-2xl leading-none">
                    {d.valor}
                    <span className="ml-1.5 text-white/30 text-[11px] font-sans font-normal">
                      {d.sufixo}
                    </span>
                  </p>
                </div>
              )
            })}
          </section>

          <section className="grid grid-cols-3 gap-3">
            <div className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flag className="text-white/40" size={15} />
                <span className="text-white/40 text-[10px] uppercase tracking-widest">Etapas</span>
              </div>
              <p className="font-display font-bold text-white text-2xl leading-none">
                {etapasRealizadas}
                <span className="text-white/30 text-base">/{(etapas ?? []).length}</span>
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-white/40" size={15} />
                <span className="text-white/40 text-[10px] uppercase tracking-widest">Pilotos</span>
              </div>
              <p className="font-display font-bold text-white text-2xl leading-none">
                {linhas.length}
              </p>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="text-white/40" size={15} />
                <span className="text-white/40 text-[10px] uppercase tracking-widest">Vencedores</span>
              </div>
              <p className="font-display font-bold text-white text-2xl leading-none">
                {linhas.filter((l) => l.vitorias > 0).length}
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-3">
              Números por piloto
            </h2>
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 border-b border-border text-white/40 text-[10px] uppercase tracking-widest">
                <span className="flex-1">Piloto</span>
                <span className="w-10 text-right">Etp</span>
                <span className="w-10 text-right">Vit</span>
                <span className="w-10 text-right">Pód</span>
                <span className="w-10 text-right hidden sm:inline">VR</span>
                <span className="w-12 text-right hidden md:inline">Melhor</span>
                <span className="w-12 text-right hidden md:inline">Média</span>
                <span className="w-14 text-right">Pts</span>
              </div>
              {linhas.map((l) => (
                <div key={l.piloto_id} className="relative border-b border-border last:border-b-0">
                  <div
                    className="absolute inset-y-0 left-0 bg-accent/[0.07]"
                    style={{ width: maxPontos ? `${(l.pontos / maxPontos) * 100}%` : '0%' }}
                  />
                  <div className="relative flex items-center gap-3 px-4 md:px-6 py-3">
                    <span className="flex-1 min-w-0 font-medium text-white truncate">
                      {l.nome}
                    </span>
                    <span className="w-10 text-right text-white/50 text-sm num-tab">{l.corridas}</span>
                    <span className={`w-10 text-right text-sm num-tab ${l.vitorias ? 'text-gold font-medium' : 'text-white/30'}`}>
                      {l.vitorias}
                    </span>
                    <span className={`w-10 text-right text-sm num-tab ${l.podios ? 'text-white/80' : 'text-white/30'}`}>
                      {l.podios}
                    </span>
                    <span className={`w-10 text-right text-sm num-tab hidden sm:inline ${l.voltas ? 'text-accent' : 'text-white/30'}`}>
                      {l.voltas}
                    </span>
                    <span className="w-12 text-right text-white/50 text-sm num-tab hidden md:inline">
                      {l.melhorPos === 99 ? '—' : `${l.melhorPos}º`}
                    </span>
                    <span className="w-12 text-right text-white/50 text-sm num-tab hidden md:inline">
                      {(l.somaPos / l.corridas).toFixed(1)}
                    </span>
                    <span className="w-14 text-right font-display font-bold text-white text-lg num-tab">
                      {l.pontos}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-white/30 text-xs">
              Etp = etapas disputadas · Vit = vitórias · Pód = pódios · VR = voltas rápidas · Melhor = melhor chegada · Média = posição média
            </p>
          </section>
        </div>
      )}
    </main>
  )
}

export const dynamic = 'force-dynamic'

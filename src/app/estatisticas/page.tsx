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

  const porNome = (a: string, b: string) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })

  const lideres = (chave: (l: Linha) => number) => {
    if (!linhas.length) return { nomes: [] as string[], valor: 0 }
    const max = Math.max(...linhas.map(chave))
    if (max <= 0) return { nomes: [] as string[], valor: 0 }
    return {
      nomes: linhas.filter((l) => chave(l) === max).map((l) => l.nome).sort(porNome),
      valor: max,
    }
  }

  const minimoCorridas = Math.max(1, Math.ceil(etapasRealizadas / 2))
  const elegiveis = linhas.filter((l) => l.corridas >= minimoCorridas)
  const melhorMedia = elegiveis.length ? Math.min(...elegiveis.map((l) => l.somaPos / l.corridas)) : 0
  const regulares = elegiveis
    .filter((l) => Math.abs(l.somaPos / l.corridas - melhorMedia) < 0.001)
    .map((l) => l.nome)
    .sort(porNome)

  const maisVitorias = lideres((l) => l.vitorias)
  const maisPodios = lideres((l) => l.podios)
  const maisVoltas = lideres((l) => l.voltas)

  const destaques = [
    { icone: Trophy, cor: 'text-gold', rotulo: 'Mais vitórias', nomes: maisVitorias.nomes, valor: maisVitorias.valor, sufixo: maisVitorias.valor === 1 ? 'vitória' : 'vitórias' },
    { icone: Medal, cor: 'text-silver', rotulo: 'Mais pódios', nomes: maisPodios.nomes, valor: maisPodios.valor, sufixo: maisPodios.valor === 1 ? 'pódio' : 'pódios' },
    { icone: Zap, cor: 'text-accent', rotulo: 'Voltas rápidas', nomes: maisVoltas.nomes, valor: maisVoltas.valor, sufixo: maisVoltas.valor === 1 ? 'volta' : 'voltas' },
    { icone: Target, cor: 'text-bronze', rotulo: 'Mais regular', nomes: regulares, valor: Number(melhorMedia.toFixed(1)), sufixo: 'posição média' },
  ]

  const vencedores = linhas.filter((l) => l.vitorias > 0).length

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <header className="mb-8">
        <p className="font-display text-xs uppercase tracking-[0.28em] text-accent">
          Temporada {campeonato.ano}
        </p>
        <h1 className="mt-1 text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
          Estatísticas
        </h1>
        <div className="mt-4 h-px w-full bg-gradient-to-r from-accent/60 via-border to-transparent" />
      </header>

      {linhas.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center">
          <TrendingUp className="text-white/15 mx-auto mb-3" size={32} />
          <p className="text-white/60 text-sm font-medium">Sem números ainda</p>
          <p className="text-white/35 text-xs mt-1">
            As estatísticas aparecem depois da primeira corrida lançada.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {destaques.map((d) => {
              const Icone = d.icone
              return (
                <div key={d.rotulo} className="bg-surface border border-border rounded-2xl p-4 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Icone className={d.cor} size={15} />
                    <span className="text-white/40 text-[10px] uppercase tracking-widest">
                      {d.rotulo}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col gap-0.5">
                    {d.nomes.length === 0 && (
                      <p className="font-display font-bold text-white/25 text-base leading-tight">—</p>
                    )}
                    {d.nomes.map((nome) => (
                      <p
                        key={nome}
                        className={`font-display font-bold text-white leading-tight truncate ${
                          d.nomes.length > 2 ? 'text-sm' : 'text-base'
                        }`}
                      >
                        {nome}
                      </p>
                    ))}
                  </div>

                  <p className="mt-3 font-display font-bold text-accent text-2xl leading-none num-tab">
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
              <div className="flex items-center gap-2 mb-3">
                <Flag className="text-white/40" size={15} />
                <span className="text-white/40 text-[10px] uppercase tracking-widest">Etapas</span>
              </div>
              <p className="font-display font-bold text-white text-3xl leading-none num-tab">
                {etapasRealizadas}
              </p>
              <p className="mt-1 text-white/35 text-xs">de {(etapas ?? []).length} no ano</p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="text-white/40" size={15} />
                <span className="text-white/40 text-[10px] uppercase tracking-widest">Pilotos</span>
              </div>
              <p className="font-display font-bold text-white text-3xl leading-none num-tab">
                {linhas.length}
              </p>
              <p className="mt-1 text-white/35 text-xs">com resultado</p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="text-white/40" size={15} />
                <span className="text-white/40 text-[10px] uppercase tracking-widest">Vencedores</span>
              </div>
              <p className="font-display font-bold text-white text-3xl leading-none num-tab">
                {vencedores}
              </p>
              <p className="mt-1 text-white/35 text-xs">
                {vencedores === 1 ? 'piloto diferente' : 'pilotos diferentes'}
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-3">
              Números por piloto
            </h2>

            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 md:px-6 py-2.5 border-b border-border text-white/35 text-[10px] uppercase tracking-widest">
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
                  <div className="relative flex items-center gap-3 px-4 md:px-6 py-3.5">
                    <span className="flex-1 min-w-0 font-medium text-white truncate">{l.nome}</span>
                    <span className="w-10 text-right text-white/50 text-sm num-tab">{l.corridas}</span>
                    <span className={`w-10 text-right text-sm num-tab ${l.vitorias ? 'text-gold font-medium' : 'text-white/25'}`}>
                      {l.vitorias}
                    </span>
                    <span className={`w-10 text-right text-sm num-tab ${l.podios ? 'text-white/80' : 'text-white/25'}`}>
                      {l.podios}
                    </span>
                    <span className={`w-10 text-right text-sm num-tab hidden sm:inline ${l.voltas ? 'text-accent' : 'text-white/25'}`}>
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

            <p className="mt-2 text-white/25 text-xs">
              Etp = etapas · Vit = vitórias · Pód = pódios · VR = voltas rápidas · Melhor = melhor chegada · Média = posição média
            </p>
          </section>
        </div>
      )}
    </main>
  )
}

export const dynamic = 'force-dynamic'

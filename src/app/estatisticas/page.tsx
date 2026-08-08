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

  const porEtapa = new Map<string, { piloto_id: string; pos: number }[]>()
  for (const r of oficiais) {
    const atual = porEtapa.get(r.etapa_id) ?? []
    atual.push({ piloto_id: r.piloto_id, pos: r.posicao_chegada })
    porEtapa.set(r.etapa_id, atual)
  }

  const confrontos = new Map<string, { venceu: number; total: number }>()
  for (const lista of porEtapa.values()) {
    for (let i = 0; i < lista.length; i++) {
      for (let j = i + 1; j < lista.length; j++) {
        const a = lista[i]
        const b = lista[j]
        const ca = confrontos.get(a.piloto_id) ?? { venceu: 0, total: 0 }
        const cb = confrontos.get(b.piloto_id) ?? { venceu: 0, total: 0 }
        ca.total += 1
        cb.total += 1
        if (a.pos < b.pos) ca.venceu += 1
        else cb.venceu += 1
        confrontos.set(a.piloto_id, ca)
        confrontos.set(b.piloto_id, cb)
      }
    }
  }

  const minimoConfrontos = Math.max(3, Math.floor((linhas.length - 1) * 0.6))

  const ranking = linhas
    .map((l) => {
      const c = confrontos.get(l.piloto_id) ?? { venceu: 0, total: 0 }
      return {
        piloto_id: l.piloto_id,
        nome: l.nome,
        venceu: c.venceu,
        total: c.total,
        taxa: c.total ? (c.venceu / c.total) * 100 : 0,
      }
    })
    .filter((x) => x.total >= minimoConfrontos)
    .sort((a, b) => b.taxa - a.taxa)

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
  const melhorMedia = elegiveis.length
    ? Math.min(...elegiveis.map((l) => l.somaPos / l.corridas))
    : 0
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
    { icone: Zap, cor: 'text-accent', rotulo: 'Mais voltas rápidas', nomes: maisVoltas.nomes, valor: maisVoltas.valor, sufixo: maisVoltas.valor === 1 ? 'volta' : 'voltas' },
    { icone: Target, cor: 'text-bronze', rotulo: 'Mais regular', nomes: regulares, valor: Number(melhorMedia.toFixed(1)), sufixo: 'posição média' },
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
                  <div className="flex flex-col gap-0.5">
                    {d.nomes.length === 0 && (
                      <p className="font-display font-bold text-white/30 text-base leading-tight">—</p>
                    )}
                    {d.nomes.map((n) => (
                      <p key={n} className={`font-display font-bold text-white leading-tight truncate ${d.nomes.length > 2 ? 'text-sm' : 'text-base'}`}>
                        {n}
                      </p>
                    ))}
                  </div>
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
              </p>
              <p className="mt-1 text-white/40 text-xs">
                de {(etapas ?? []).length} no ano
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

          {ranking.length > 0 && (
            <section>
              <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-1">
                Confrontos diretos
              </h2>
              <p className="text-white/30 text-xs mb-3">
                Em cada corrida, quantas vezes o piloto terminou à frente de cada adversário.
              </p>
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                {ranking.map((x, i) => (
                  <div key={x.piloto_id} className="relative border-b border-border last:border-b-0">
                    <div
                      className="absolute inset-y-0 left-0 bg-accent/[0.09]"
                      style={{ width: `${x.taxa}%` }}
                    />
                    <div className="relative flex items-center gap-3 px-4 md:px-6 py-3">
                      <span className="w-6 text-right font-display font-bold text-white/25 text-sm num-tab shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1 min-w-0 font-medium text-white truncate">
                        {x.nome}
                      </span>
                      <span className="text-white/35 text-xs num-tab shrink-0 hidden sm:inline">
                        {x.venceu} de {x.total}
                      </span>
                      <span className="w-16 text-right font-display font-bold text-white text-lg num-tab shrink-0">
                        {Math.round(x.taxa)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-white/30 text-xs">
                Considera apenas pilotos com {minimoConfrontos} confrontos ou mais.
              </p>
            </section>
          )}

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

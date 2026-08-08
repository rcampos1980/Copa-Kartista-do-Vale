import { createClient } from '@/lib/supabase/server'
import { getAnoSelecionado, getTemporadas } from '@/lib/temporada'
import { SeletorTemporada } from '@/components/SeletorTemporada'
import { PainelEstatisticas } from './PainelEstatisticas'
import type { Destaque, LinhaPiloto } from './PainelEstatisticas'
import { TrendingUp } from 'lucide-react'

export default async function EstatisticasPage() {
  const supabase = await createClient()
  const [ano, temporadas] = await Promise.all([getAnoSelecionado(), getTemporadas()])

  const consulta = supabase.from('campeonatos').select('id, ano, nome, bonus_melhor_volta')
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
    .select('id, status')
    .eq('campeonato_id', campeonato.id)
    .order('data', { ascending: true })

  const idsEtapas = (etapas ?? []).map((e) => e.id)

  const [{ data: resultados }, { data: pilotosPub }, { data: regraTopo }] = await Promise.all([
    idsEtapas.length
      ? supabase.from('vw_resultados_publico').select('*').in('etapa_id', idsEtapas)
      : Promise.resolve({ data: [] as Record<string, never>[] }),
    supabase.from('vw_pilotos_publico').select('id, foto_url'),
    supabase
      .from('regras_pontuacao')
      .select('pontos')
      .eq('campeonato_id', campeonato.id)
      .order('pontos', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  // Teto real de uma corrida: pontos do 1o lugar + bonus de volta rapida.
  // Serve de base para o aproveitamento, que assim tem 100% de verdade.
  const pontosPrimeiro = regraTopo?.pontos ?? 0
  const bonusVolta = campeonato.bonus_melhor_volta ?? 0
  const tetoPorCorrida = pontosPrimeiro + bonusVolta

  const fotoPorPiloto = new Map<string, string | null>(
    (pilotosPub ?? []).map((p: { id: string; foto_url: string | null }) => [p.id, p.foto_url])
  )

  const oficiais = (resultados ?? []).filter((r) => !r.is_convidado)

  const mapa = new Map<string, LinhaPiloto>()
  for (const r of oficiais) {
    const atual = mapa.get(r.piloto_id) ?? {
      piloto_id: r.piloto_id,
      nome: r.piloto_nome ?? 'Piloto',
      foto: fotoPorPiloto.get(r.piloto_id) ?? null,
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

  const porNome = (a: string, b: string) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })

  const lideres = (chave: (l: LinhaPiloto) => number) => {
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

  const destaques: Destaque[] = [
    {
      chave: 'vitorias',
      rotulo: 'Mais vitórias',
      nomes: maisVitorias.nomes,
      valor: maisVitorias.valor,
      sufixo: maisVitorias.valor === 1 ? 'vitória' : 'vitórias',
      dica: 'Quem mais cruzou a linha em primeiro nesta temporada.',
    },
    {
      chave: 'podios',
      rotulo: 'Mais pódios',
      nomes: maisPodios.nomes,
      valor: maisPodios.valor,
      sufixo: maisPodios.valor === 1 ? 'pódio' : 'pódios',
      dica: 'Chegadas entre os três primeiros.',
    },
    {
      chave: 'voltas',
      rotulo: 'Voltas rápidas',
      nomes: maisVoltas.nomes,
      valor: maisVoltas.valor,
      sufixo: maisVoltas.valor === 1 ? 'volta' : 'voltas',
      dica: 'A volta mais rápida de cada corrida. Vale pontos de bônus.',
    },
    {
      chave: 'regular',
      rotulo: 'Mais regular',
      nomes: regulares,
      valor: Number(melhorMedia.toFixed(1)),
      sufixo: 'posição média',
      dica: `Melhor média de chegada entre quem correu ao menos ${minimoCorridas} ${
        minimoCorridas === 1 ? 'etapa' : 'etapas'
      }.`,
    },
  ]

  const vencedores = linhas.filter((l) => l.vitorias > 0).length

  return (
    <main className="min-h-screen px-4 py-8 md:px-10 md:py-12">
      <header className="mb-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display text-xs uppercase tracking-[0.28em] text-accent">
              Temporada {campeonato.ano}
            </p>
            <h1 className="mt-1 text-3xl md:text-4xl font-display font-bold text-white tracking-tight">
              Estatísticas
            </h1>
            <p className="mt-1 text-white/40 text-sm">
              Acompanhe o desempenho de todos na temporada
            </p>
          </div>

          <div className="print:hidden">
            <SeletorTemporada temporadas={temporadas} anoAtual={campeonato.ano} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="h-[3px] w-16 rounded-full bg-accent" />
          <span className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
        </div>
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
        <PainelEstatisticas
          ano={campeonato.ano}
          destaques={destaques}
          linhas={linhas}
          etapasRealizadas={etapasRealizadas}
          totalEtapas={(etapas ?? []).length}
          vencedores={vencedores}
          tetoPorCorrida={tetoPorCorrida}
          pontosPrimeiro={pontosPrimeiro}
          bonusVolta={bonusVolta}
        />
      )}
    </main>
  )
}

export const dynamic = 'force-dynamic'

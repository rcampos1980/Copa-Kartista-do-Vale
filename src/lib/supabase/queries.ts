import { createClient } from './client'

const ANO_ATUAL = 2026

export async function getDashboardData() {
  const supabase = createClient()

  const { data: campeonato } = await supabase
    .from('campeonatos')
    .select('id, ano, nome')
    .eq('ano', ANO_ATUAL)
    .single()

  if (!campeonato) {
    return null
  }

  const [
    { data: classificacao },
    { data: proximaEtapa },
    { data: ultimaCorrida },
    { count: totalPilotos },
    { count: totalEtapas },
  ] = await Promise.all([
    supabase
      .from('vw_classificacao')
      .select('*')
      .eq('campeonato_id', campeonato.id)
      .order('pontos_totais', { ascending: false }),
    supabase
      .from('etapas')
      .select('*')
      .eq('campeonato_id', campeonato.id)
      .eq('status', 'agendada')
      .order('data', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('etapas')
      .select('*')
      .eq('campeonato_id', campeonato.id)
      .eq('status', 'realizada')
      .order('data', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('participacoes')
      .select('*', { count: 'exact', head: true })
      .eq('campeonato_id', campeonato.id)
      .eq('tipo', 'fixo'),
    supabase
      .from('etapas')
      .select('*', { count: 'exact', head: true })
      .eq('campeonato_id', campeonato.id),
  ])

  return {
    campeonato,
    classificacao: classificacao ?? [],
    proximaEtapa: proximaEtapa ?? null,
    ultimaCorrida: ultimaCorrida ?? null,
    totalPilotos: totalPilotos ?? 0,
    totalEtapas: totalEtapas ?? 0,
  }
}

export async function getClassificacao() {
  const supabase = createClient()

  const { data: campeonato } = await supabase
    .from('campeonatos')
    .select('id, ano, nome')
    .eq('ano', ANO_ATUAL)
    .single()

  if (!campeonato) return null

  const { data: classificacao } = await supabase
    .from('vw_classificacao')
    .select('*')
    .eq('campeonato_id', campeonato.id)
    .order('pontos_totais', { ascending: false })

  return {
    campeonato,
    classificacao: classificacao ?? [],
  }
}

export async function getPilotos() {
  const supabase = createClient()

  const { data: campeonato } = await supabase
    .from('campeonatos')
    .select('id, ano')
    .eq('ano', ANO_ATUAL)
    .single()

  const { data: pilotos } = await supabase
    .from('vw_pilotos_publico')
    .select('*')
    .eq('ativo', true)
    .order('nome', { ascending: true })

  let participacoes: { piloto_id: string; tipo: string }[] = []
  if (campeonato) {
    const { data } = await supabase
      .from('participacoes')
      .select('piloto_id, tipo')
      .eq('campeonato_id', campeonato.id)
    participacoes = data ?? []
  }

  const tipoPorPiloto = new Map(participacoes.map((p) => [p.piloto_id, p.tipo]))

  return (pilotos ?? []).map((p) => ({
    ...p,
    tipo: tipoPorPiloto.get(p.id) ?? null,
  }))
}

export async function getPilotoPerfil(pilotoId: string) {
  const supabase = createClient()

  const { data: campeonato } = await supabase
    .from('campeonatos')
    .select('id, ano')
    .eq('ano', ANO_ATUAL)
    .single()

  const { data: piloto } = await supabase
    .from('vw_pilotos_publico')
    .select('*')
    .eq('id', pilotoId)
    .maybeSingle()

  if (!piloto) return null

  const { data: stats } = await supabase
    .from('vw_classificacao')
    .select('*')
    .eq('piloto_id', pilotoId)
    .maybeSingle()

  const { data: resultados } = await supabase
    .from('resultados')
    .select('posicao_chegada, pontos, is_convidado, etapas(nome, pista, data)')
    .eq('piloto_id', pilotoId)
    .order('etapas(data)', { ascending: false })

  let tipo: string | null = null
  if (campeonato) {
    const { data: part } = await supabase
      .from('participacoes')
      .select('tipo')
      .eq('piloto_id', pilotoId)
      .eq('campeonato_id', campeonato.id)
      .maybeSingle()
    tipo = part?.tipo ?? null
  }

  return {
    piloto: { ...piloto, tipo },
    stats: stats ?? { pontos_totais: 0, vitorias: 0, podios: 0 },
    resultados: resultados ?? [],
  }
}

export async function getEtapas() {
  const supabase = createClient()

  const { data: campeonato } = await supabase
    .from('campeonatos')
    .select('id, ano')
    .eq('ano', ANO_ATUAL)
    .single()

  if (!campeonato) return { campeonato: null, etapas: [] }

  const { data: etapas } = await supabase
    .from('etapas')
    .select('*')
    .eq('campeonato_id', campeonato.id)
    .order('data', { ascending: true })

  return { campeonato, etapas: etapas ?? [] }
}

export async function getEtapaDetalhe(etapaId: string) {
  const supabase = createClient()

  const { data: etapa } = await supabase
    .from("etapas")
    .select("*, campeonatos(nome, ano)")
    .eq("id", etapaId)
    .maybeSingle()

  if (!etapa) return null

  const { data: resultados } = await supabase
    .from("vw_resultados_publico")
    .select("*")
    .eq("etapa_id", etapaId)
    .order("posicao_chegada", { ascending: true })

  const { data: lastro } = await supabase
    .rpc("relatorio_lastro_etapa", { etapa_uuid: etapaId })

  return { etapa, resultados: resultados ?? [], lastro: lastro ?? [] }
}

export async function getLastro(campeonatoId: string) {
  const supabase = createClient()

  const { data } = await supabase
    .from('vw_lastro')
    .select('*')
    .eq('campeonato_id', campeonatoId)
    .order('lastro', { ascending: false })

  return data ?? []
}

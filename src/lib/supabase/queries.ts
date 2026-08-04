import { createClient } from './client'

// Resolve o campeonato: se 'ano' vier, filtra por ele; senao, pega o mais recente
async function resolverCampeonato(
  supabase: ReturnType<typeof createClient>,
  ano?: number
) {
  if (ano != null) {
    const { data } = await supabase
      .from('campeonatos')
      .select('id, ano, nome')
      .eq('ano', ano)
      .maybeSingle()
    return data
  }
  const { data } = await supabase
    .from('campeonatos')
    .select('id, ano, nome')
    .order('ano', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

export async function getDashboardData(ano?: number) {
  const supabase = createClient()

  const campeonato = await resolverCampeonato(supabase, ano)
  if (!campeonato) return null

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

export async function getClassificacao(ano?: number) {
  const supabase = createClient()

  const campeonato = await resolverCampeonato(supabase, ano)
  if (!campeonato) return null

  const { data: classificacao } = await supabase
    .from('vw_classificacao')
    .select('*')
    .eq('campeonato_id', campeonato.id)
    .order('pontos_totais', { ascending: false })
    .order('nome', { ascending: true })

  return { campeonato, classificacao: classificacao ?? [] }
}

export async function getPilotos(ano?: number) {
  const supabase = createClient()

  const campeonato = await resolverCampeonato(supabase, ano)

  const { data: pilotos } = await supabase
    .from('vw_pilotos_publico')
    .select('*')
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

export async function getPilotoPerfil(pilotoId: string, ano?: number) {
  const supabase = createClient()

  const campeonato = await resolverCampeonato(supabase, ano)

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

export async function getEtapas(ano?: number) {
  const supabase = createClient()

  const campeonato = await resolverCampeonato(supabase, ano)
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

export async function getDadosLancamento(etapaId: string) {
  const supabase = createClient()

  const { data: etapa } = await supabase
    .from('etapas')
    .select('*, campeonatos(nome, ano)')
    .eq('id', etapaId)
    .maybeSingle()

  if (!etapa) return null

  // tipo (fixo/convidado) por piloto, no campeonato
  const { data: participacoes } = await supabase
    .from('participacoes')
    .select('piloto_id, tipo')
    .eq('campeonato_id', etapa.campeonato_id)

  const tipoPorPiloto = new Map(
    (participacoes ?? []).map((p) => [p.piloto_id, p.tipo])
  )

  // Quem foi associado no botao "Pilotos" — fonte de verdade de quem corre
  const { data: assoc } = await supabase
    .from('etapa_pilotos')
    .select('piloto_id')
    .eq('etapa_id', etapaId)

  const idsAssociados = (assoc ?? []).map((r) => r.piloto_id)
  const associadosSet = new Set(idsAssociados)

  // TODOS os pilotos (sem filtro de ativo), para nao perder quem
  // ficou inativo DEPOIS de ja ter sido associado a uma corrida passada
  const { data: pilotosPub } = await supabase
    .from('vw_pilotos_publico')
    .select('id, nome, numero_kart, ativo')
    .order('nome', { ascending: true })

  const todos = (pilotosPub ?? []).map((p) => ({
    id: p.id,
    nome: p.nome,
    numero_kart: p.numero_kart,
    ativo: p.ativo,
    tipo: tipoPorPiloto.get(p.id) ?? null,
  }))

  // Lista da etapa = apenas os associados (mesmo inativos), em ordem alfabetica
  const listaPilotos = todos
    .filter((p) => associadosSet.has(p.id))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))

  const { data: resultados } = await supabase
    .from('resultados')
    .select('piloto_id, posicao_chegada, is_convidado, peso_convidado, melhor_volta_flag')
    .eq('etapa_id', etapaId)

  return {
    etapa,
    listaPilotos,
    idsAssociados,
    todosPilotos: todos,
    resultados: resultados ?? [],
  }
}

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

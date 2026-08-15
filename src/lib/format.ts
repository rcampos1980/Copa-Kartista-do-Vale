// Formata uma data 'YYYY-MM-DD' sem sofrer com fuso horário.
// new Date('2026-02-15') vira meia-noite UTC e "volta um dia" no Brasil.
// Aqui montamos a data no fuso local, evitando o deslocamento.
export function formatarData(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split('T')[0].split('-').map(Number)
  const data = new Date(ano, mes - 1, dia)
  return data.toLocaleDateString('pt-BR')
}

// Pluraliza corretamente: pluralizar(1, 'vitória', 'vitórias') => '1 vitória'
export function pluralizar(qtd: number, singular: string, plural: string): string {
  return `${qtd} ${qtd === 1 ? singular : plural}`
}

// O site roda na Vercel, que usa UTC. Sao Paulo esta 3 horas atras, entao das
// 21h a meia-noite o servidor ja virou o dia e a contagem regressiva errava um
// dia. Tudo que depende de "hoje" passa por aqui.
export const FUSO = 'America/Sao_Paulo'

const formatadorDia = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

// Devolve 'YYYY-MM-DD' do dia atual em Sao Paulo.
export function hojeEmSaoPaulo(): string {
  return formatadorDia.format(new Date())
}

// Converte um instante (timestamp do banco) para o dia 'YYYY-MM-DD' em Sao Paulo.
export function diaEmSaoPaulo(instante: Date | string): string {
  return formatadorDia.format(typeof instante === 'string' ? new Date(instante) : instante)
}

// Diferenca em dias entre duas datas 'YYYY-MM-DD'. Usa Date.UTC de proposito:
// assim o horario de verao nunca introduz um erro de 23 ou 25 horas.
export function diasEntre(deIso: string, ateIso: string): number {
  const emUtc = (iso: string) => {
    const [ano, mes, dia] = iso.split('T')[0].split('-').map(Number)
    return Date.UTC(ano, mes - 1, dia)
  }
  return Math.round((emUtc(ateIso) - emUtc(deIso)) / 86400000)
}

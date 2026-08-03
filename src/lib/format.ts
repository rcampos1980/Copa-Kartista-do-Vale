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

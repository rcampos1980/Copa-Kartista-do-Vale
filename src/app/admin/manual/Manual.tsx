'use client'

import { useState } from 'react'
import {
  CalendarRange, Users, Flag, Trophy, Weight, Images, KeyRound, BookOpen,
  AlertTriangle, ChevronDown, ClipboardList, Printer, CheckCircle2, Camera,
} from 'lucide-react'

type Passo = { titulo: string; texto: string }
type Secao = {
  id: string
  icone: typeof Users
  titulo: string
  resumo: string
  passos: Passo[]
  atencao?: string
}
type Grupo = { nome: string; descricao: string; secoes: Secao[] }

const rotina = [
  { icone: Users, titulo: 'Associar', detalhe: 'Marque quem confirmou' },
  { icone: Weight, titulo: 'Conferir lastro', detalhe: 'Veja a distribuição' },
  { icone: Printer, titulo: 'Imprimir', detalhe: 'Leve para a pista' },
  { icone: ClipboardList, titulo: 'Lançar resultado', detalhe: 'Com a volta rápida' },
  { icone: CheckCircle2, titulo: 'Marcar realizada', detalhe: 'Congela o lastro' },
  { icone: Camera, titulo: 'Subir mídia', detalhe: 'Fotos e vídeos' },
]

const grupos: Grupo[] = [
  {
    nome: 'A cada corrida',
    descricao: 'O que se repete toda etapa.',
    secoes: [
      {
        id: 'antes',
        icone: Flag,
        titulo: 'Antes da corrida',
        resumo: 'A preparação que precisa estar pronta antes de sair de casa.',
        passos: [
          { titulo: 'Associar quem vai correr', texto: 'Aba Etapas, ícone de pessoas na linha da etapa. Marque os confirmados. Pode refazer a qualquer momento, sem trava de data.' },
          { titulo: 'Conferir o lastro', texto: 'Abra a etapa pelo menu Etapas e veja o relatório. As etiquetas do topo mostram a distribuição, tipo 20 kg para 2 pilotos.' },
          { titulo: 'Imprimir', texto: 'Botão Imprimir lastros. O arquivo sai nomeado com campeonato, pista e data. Fotos e vídeos não entram na impressão.' },
        ],
      },
      {
        id: 'depois',
        icone: Trophy,
        titulo: 'Depois da corrida',
        resumo: 'Lançar o resultado e publicar o material.',
        passos: [
          { titulo: 'Lançar o resultado', texto: 'Aba Etapas, ícone de prancheta. Só aparecem os pilotos associados. Informe a posição de cada um e marque exatamente um com a volta rápida.' },
          { titulo: 'Conferir antes de salvar', texto: 'Um painel de revisão mostra o resumo e avisa se algum associado ficou sem posição. Nada é gravado até você confirmar.' },
          { titulo: 'Mudar o status', texto: 'Aba Etapas, ícone de lápis. De agendada para realizada. É uma ação separada do lançamento, de propósito.' },
          { titulo: 'Subir fotos e vídeos', texto: 'Aba Etapas, ícone de imagens. Links do YouTube e fotos aparecem na página pública da etapa.' },
        ],
        atencao: 'Convidado não pontua na classificação, mas entra no cálculo do lastro e pode marcar a volta rápida.',
      },
      {
        id: 'lastro',
        icone: Weight,
        titulo: 'Lastro de corridas passadas',
        resumo: 'Como o histórico fica protegido e quando você pode intervir.',
        passos: [
          { titulo: 'Etapa agendada', texto: 'O lastro é calculado ao vivo pelos pesos atuais. Corrigiu um peso, o relatório muda na hora.' },
          { titulo: 'Etapa realizada', texto: 'O lastro fica congelado no valor do dia da corrida. Mexer no peso hoje não altera o que já passou.' },
          { titulo: 'Atualizar pelos pesos atuais', texto: 'Botão dentro do relatório expandido. Reescreve os valores congelados. Use quando descobrir que um peso estava errado desde o começo.' },
          { titulo: 'Ajuste manual', texto: 'Botão ao lado. Libera a edição valor por valor, para quando na pista foi usado um lastro diferente. Clique em Concluir ajuste ao terminar.' },
        ],
        atencao: 'Atualizar pelos pesos atuais substitui todos os ajustes manuais daquela etapa. Há uma confirmação antes.',
      },
      {
        id: 'midia',
        icone: Images,
        titulo: 'Fotos e vídeos',
        resumo: 'Detalhes que evitam frustração no envio.',
        passos: [
          { titulo: 'Vídeos', texto: 'Cole o link do YouTube. A miniatura é buscada automaticamente. O título é opcional.' },
          { titulo: 'Fotos', texto: 'Pode selecionar várias de uma vez. Cada envio leva alguns segundos por foto.' },
          { titulo: 'Remover', texto: 'Ícone de lixeira ao lado do vídeo ou sobre a foto.' },
        ],
        atencao: 'Foto acima de 4 MB pode falhar no site publicado. Se acontecer, reduza a imagem antes de enviar.',
      },
    ],
  },
  {
    nome: 'Pessoas e acesso',
    descricao: 'Quem corre e quem entra no site.',
    secoes: [
      {
        id: 'pilotos',
        icone: Users,
        titulo: 'Cadastrar e gerenciar pilotos',
        resumo: 'Quem corre, quanto pesa e quem tem acesso.',
        passos: [
          { titulo: 'Novo piloto', texto: 'Aba Pilotos, botão Novo piloto. Nome, peso e tipo são obrigatórios. Fixo pontua, convidado não.' },
          { titulo: 'Peso', texto: 'É por temporada. Alimenta o lastro, que é a diferença até o peso-alvo arredondada para baixo de 5 em 5 kg.' },
          { titulo: 'Ativo ou inativo', texto: 'O olho na lista alterna. Inativo some das listas novas mas continua no histórico das corridas que disputou.' },
          { titulo: 'Dar acesso', texto: 'Preencha o e-mail e salve. A conta é criada e um código é enviado automaticamente. Sem e-mail, não há acesso.' },
          { titulo: 'Tornar administrador', texto: 'Ative o botão É administrador antes de salvar. Administrador vê o menu Administração e altera tudo.' },
        ],
        atencao: 'Só quem tem e-mail cadastrado aqui consegue criar conta. É essa lista que protege o site de estranhos.',
      },
      {
        id: 'acesso',
        icone: KeyRound,
        titulo: 'Quando um piloto não consegue entrar',
        resumo: 'Os três problemas que aparecem na prática.',
        passos: [
          { titulo: 'Não recebeu o código', texto: 'Peça para olhar o spam. Se não estiver lá, clique no avião de papel na linha dele para reenviar.' },
          { titulo: 'Código expirado', texto: 'Códigos são de uso único e valem 1 hora. Basta reenviar.' },
          { titulo: 'Esqueceu a senha', texto: 'Mesmo caminho: avião de papel. Ele recebe um código novo e define outra senha.' },
        ],
      },
    ],
  },
  {
    nome: 'Uma vez por ano',
    descricao: 'A virada de temporada.',
    secoes: [
      {
        id: 'temporada',
        icone: CalendarRange,
        titulo: 'Abrir uma temporada nova',
        resumo: 'A sequência completa, antes da primeira corrida.',
        passos: [
          { titulo: 'Criar a temporada', texto: 'Aba Temporadas, botão Nova temporada. Ano, nome, peso-alvo e bônus da volta rápida. Ela nasce em branco.' },
          { titulo: 'Definir a pontuação', texto: 'Aba Pontuação. Quantos pontos vale cada posição, de 1º a 30º. Posições que não pontuam ficam com zero.' },
          { titulo: 'Revisar os pilotos', texto: 'Aba Pilotos. Confira quem continua, atualize os pesos e desative quem saiu.' },
          { titulo: 'Cadastrar as etapas', texto: 'Aba Etapas. Uma linha por corrida, com nome, pista e data. Todas nascem agendadas.' },
          { titulo: 'Escrever o regulamento', texto: 'Aba Temporadas, lápis na linha da temporada.' },
        ],
        atencao: 'A pontuação zera a cada temporada. Nada de 2026 soma com 2027 — cada ano é um campeonato separado.',
      },
      {
        id: 'visibilidade',
        icone: BookOpen,
        titulo: 'Regulamento e temporadas visíveis',
        resumo: 'O que os pilotos veem e o que fica só para você.',
        passos: [
          { titulo: 'Publicar o regulamento', texto: 'Aba Temporadas, lápis, campo Regulamento. As quebras de linha são preservadas. Uma linha em branco entre parágrafos.' },
          { titulo: 'Onde aparece', texto: 'No menu Regras, seguindo a temporada que o piloto selecionou.' },
          { titulo: 'Ocultar temporadas antigas', texto: 'Ícone do olho na linha da temporada. Ocultas somem do seletor e do menu Regras, mas os dados ficam intactos.' },
        ],
      },
    ],
  },
]

export function Manual() {
  const [abertas, setAbertas] = useState<string[]>(['antes'])

  const alternar = (id: string) =>
    setAbertas((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]))

  const todas = grupos.flatMap((g) => g.secoes.map((s) => s.id))
  const tudoAberto = abertas.length === todas.length

  return (
    <div className="max-w-3xl">
      <section className="mb-8 rounded-2xl border border-accent/30 bg-surface p-5 md:p-6">
        <p className="font-display uppercase text-[10px] tracking-[0.2em] text-accent mb-4">
          Rotina de uma etapa
        </p>
        <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {rotina.map((r, i) => {
            const Icone = r.icone
            return (
              <li key={r.titulo} className="relative flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 border border-accent/25 shrink-0">
                    <Icone className="text-accent" size={14} />
                  </span>
                  <span className="font-display font-bold text-white/25 text-lg leading-none">
                    {i + 1}
                  </span>
                </div>
                <p className="text-white text-[13px] font-medium leading-tight">{r.titulo}</p>
                <p className="text-white/35 text-[11px] leading-tight">{r.detalhe}</p>
              </li>
            )
          })}
        </ol>
      </section>

      <div className="mb-5 flex justify-end">
        <button
          onClick={() => setAbertas(tudoAberto ? [] : todas)}
          className="text-white/40 hover:text-white text-xs transition-colors"
        >
          {tudoAberto ? 'Recolher tudo' : 'Expandir tudo'}
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {grupos.map((g) => (
          <div key={g.nome}>
            <div className="mb-3">
              <h2 className="font-display uppercase text-sm tracking-wide text-white/70">
                {g.nome}
              </h2>
              <p className="text-white/30 text-xs">{g.descricao}</p>
            </div>

            <div className="flex flex-col gap-2">
              {g.secoes.map((s) => {
                const Icone = s.icone
                const aberta = abertas.includes(s.id)
                return (
                  <section
                    key={s.id}
                    className={`rounded-2xl border bg-surface overflow-hidden transition-colors ${
                      aberta ? 'border-accent/25' : 'border-border'
                    }`}
                  >
                    <button
                      onClick={() => alternar(s.id)}
                      className="w-full flex items-center gap-3 px-4 md:px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border shrink-0 transition-colors ${
                          aberta ? 'bg-accent/15 border-accent/30' : 'bg-bg border-border'
                        }`}
                      >
                        <Icone className={aberta ? 'text-accent' : 'text-white/50'} size={17} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-display font-bold text-white text-base leading-tight">
                          {s.titulo}
                        </span>
                        <span className="block text-white/35 text-xs mt-0.5 truncate">
                          {s.resumo}
                        </span>
                      </span>
                      <span className="text-white/25 text-xs shrink-0 hidden sm:block">
                        {s.passos.length} passos
                      </span>
                      <ChevronDown
                        className={`text-white/40 shrink-0 transition-transform ${aberta ? 'rotate-180' : ''}`}
                        size={17}
                      />
                    </button>

                    {aberta && (
                      <div className="px-4 md:px-5 pb-5 pt-1">
                        <ol className="flex flex-col gap-3.5 border-l border-border pl-4 ml-1">
                          {s.passos.map((p, i) => (
                            <li key={p.titulo} className="relative">
                              <span className="absolute -left-[21px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-surface border-2 border-accent/40" />
                              <p className="text-white font-medium text-sm">
                                <span className="text-white/30 mr-1.5">{i + 1}.</span>
                                {p.titulo}
                              </p>
                              <p className="text-white/55 text-sm leading-relaxed mt-0.5">
                                {p.texto}
                              </p>
                            </li>
                          ))}
                        </ol>

                        {s.atencao && (
                          <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3">
                            <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={15} />
                            <p className="text-amber-200/80 text-sm leading-relaxed">{s.atencao}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

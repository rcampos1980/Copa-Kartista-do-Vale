'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Zap, AlertTriangle } from 'lucide-react'

type Piloto = { id: string; nome: string; numero_kart: number | null; tipo?: string | null }

type ResultadoSalvo = {
  piloto_id: string
  posicao_chegada: number
  is_convidado: boolean
  peso_convidado: number | null
  melhor_volta_flag: boolean
}

type Linha = {
  piloto_id: string
  nome: string
  is_convidado: boolean
  posicao: string
  melhor_volta: boolean
}

type Props = {
  etapaId: string
  campeonatoId: string
  pilotos: Piloto[]
  resultadosSalvos: ResultadoSalvo[]
  dataLiberada: boolean
  salvarResultados: (
    etapaId: string,
    campeonatoId: string,
    linhas: {
      piloto_id: string
      posicao_chegada: number
      is_convidado: boolean
      peso_convidado: number | null
      melhor_volta_flag: boolean
    }[]
  ) => Promise<void>
}

export function FormResultado({
  etapaId,
  campeonatoId,
  pilotos,
  resultadosSalvos,
  dataLiberada,
  salvarResultados,
}: Props) {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [revisando, setRevisando] = useState(false)
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')

  function montarInicial(): Linha[] {
    const salvosPorId = new Map(resultadosSalvos.map((r) => [r.piloto_id, r]))
    const temSalvos = resultadosSalvos.length > 0

    return [...pilotos]
      .sort((a, b) => {
        if (temSalvos) {
          const pa = salvosPorId.get(a.id)?.posicao_chegada ?? Infinity
          const pb = salvosPorId.get(b.id)?.posicao_chegada ?? Infinity
          if (pa !== pb) return pa - pb
        }
        return a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
      })
      .map((p) => {
        const s = salvosPorId.get(p.id)
        return {
          piloto_id: p.id,
          nome: p.nome,
          is_convidado: p.tipo === 'convidado',
          posicao: s ? String(s.posicao_chegada) : '',
          melhor_volta: s ? s.melhor_volta_flag : false,
        }
      })
  }

  const [linhas, setLinhas] = useState<Linha[]>(montarInicial)

  function setPosicao(indice: number, valor: string) {
    const limpo = valor.replace(/[^0-9]/g, '')
    setLinhas((prev) =>
      prev.map((l, i) =>
        i === indice
          ? { ...l, posicao: limpo, melhor_volta: limpo === '' ? false : l.melhor_volta }
          : l
      )
    )
  }

  function ordenarPorPosicao() {
    setLinhas((prev) =>
      [...prev].sort((a, b) => {
        const pa = a.posicao === '' ? Infinity : Number(a.posicao)
        const pb = b.posicao === '' ? Infinity : Number(b.posicao)
        if (pa !== pb) return pa - pb
        return a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
      })
    )
  }

  function marcarMelhorVolta(indice: number) {
    setLinhas((prev) =>
      prev.map((l, i) => ({ ...l, melhor_volta: i === indice ? !l.melhor_volta : false }))
    )
  }

  function validar(): string | null {
    if (!dataLiberada) {
      return 'Esta etapa ainda não aconteceu. O resultado só pode ser lançado a partir da data da corrida.'
    }
    const comPos = linhas.filter((l) => l.posicao !== '')
    if (comPos.length === 0) {
      return 'Preencha a posição de pelo menos um piloto.'
    }
    const posicoes = comPos.map((l) => Number(l.posicao))
    const repetidas = [...new Set(posicoes.filter((p, i) => posicoes.indexOf(p) !== i))]
    if (repetidas.length > 0) {
      return `Posição repetida: ${repetidas.join(', ')}. Cada posição deve ser única.`
    }
    const melhores = comPos.filter((l) => l.melhor_volta)
    if (melhores.length === 0) {
      return 'A melhor volta é obrigatória. Marque o raio (⚡) do piloto que fez a volta mais rápida.'
    }
    if (melhores.length > 1) {
      return 'Só pode haver uma melhor volta.'
    }
    return null
  }

  function abrirRevisao() {
    setErro('')
    setMsg('')
    const problema = validar()
    if (problema) {
      setErro(problema)
      return
    }
    setRevisando(true)
  }

  async function confirmarSalvar() {
    const problema = validar()
    if (problema) {
      setErro(problema)
      setRevisando(false)
      return
    }
    setSalvando(true)
    const payload = linhas
      .filter((l) => l.posicao !== '')
      .map((l) => ({
        piloto_id: l.piloto_id,
        posicao_chegada: Number(l.posicao),
        is_convidado: l.is_convidado,
        peso_convidado: null,
        melhor_volta_flag: l.melhor_volta,
      }))
    await salvarResultados(etapaId, campeonatoId, payload)
    setSalvando(false)
    setRevisando(false)
    setMsg('Resultado salvo com sucesso!')
    router.refresh()
  }

  const comPosicao = linhas.filter((l) => l.posicao !== '')
  const semPosicao = linhas.filter((l) => l.posicao === '')
  const resumo = [...comPosicao].sort((a, b) => Number(a.posicao) - Number(b.posicao))

  if (pilotos.length === 0) {
    return (
      <section className="bg-surface border border-border rounded-2xl p-6">
        <p className="text-white/50 text-sm">
          Nenhum piloto associado a esta etapa. Use o botão Pilotos para definir quem corre.
        </p>
      </section>
    )
  }

  return (
    <section className="bg-surface border border-border rounded-2xl p-5">
      {!revisando ? (
        <>
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-1">
            Resultado da corrida
          </h2>
          <p className="text-white/40 text-xs mb-4">
            Pilotos associados no botão Pilotos. Digite a posição de cada um e marque a melhor volta
            (obrigatória, use o raio ⚡).
            <span className="text-white/60"> {comPosicao.length}/{pilotos.length} preenchidos.</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {linhas.map((l, i) => (
              <div
                key={l.piloto_id}
                className="flex items-center gap-2 rounded-lg border border-border bg-bg px-2.5 py-1.5"
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={l.posicao}
                  onChange={(e) => setPosicao(i, e.target.value)}
                  onBlur={ordenarPorPosicao}
                  placeholder="—"
                  className="w-10 text-center bg-surface border border-border rounded-md px-1 py-1 text-white font-display font-bold text-base outline-none focus:border-accent transition-colors shrink-0"
                />
                <span className="flex-1 text-sm font-medium text-white truncate">
                  {l.nome}
                  {l.is_convidado && (
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-medium text-sky-400">
                      Conv.
                    </span>
                  )}
                </span>
                <button
                  onClick={() => marcarMelhorVolta(i)}
                  disabled={l.posicao === ''}
                  className={`p-1 rounded-md transition-colors shrink-0 disabled:opacity-25 ${
                    l.melhor_volta ? 'bg-gold/20 text-gold' : 'text-white/30 hover:text-white'
                  }`}
                  title="Melhor volta"
                >
                  <Zap size={15} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={abrirRevisao}
            disabled={!dataLiberada}
            className="mt-5 w-full bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-colors"
          >
            <Save size={18} /> Revisar e salvar
          </button>
          {erro && <p className="mt-3 text-sm text-accent">{erro}</p>}
          {msg && <p className="mt-3 text-sm text-emerald-400">{msg}</p>}
        </>
      ) : (
        <>
          <h2 className="font-display uppercase text-sm tracking-wide text-white/50 mb-1">
            Confira antes de salvar
          </h2>
          <p className="text-white/40 text-xs mb-4">
            Revise o resultado abaixo. Nada é gravado até você confirmar.
          </p>

          <div className="rounded-xl border border-border bg-bg overflow-hidden">
            {resumo.map((l) => (
              <div
                key={l.piloto_id}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-b-0"
              >
                <span className="font-display font-bold text-accent text-lg w-8 shrink-0">
                  {l.posicao}º
                </span>
                <span className="flex-1 text-sm font-medium text-white truncate">
                  {l.nome}
                  {l.is_convidado && (
                    <span className="ml-1.5 inline-flex items-center rounded-full bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-medium text-sky-400">
                      Convidado
                    </span>
                  )}
                </span>
                {l.melhor_volta && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-medium text-gold shrink-0">
                    <Zap size={11} /> Melhor volta
                  </span>
                )}
              </div>
            ))}
          </div>

          {semPosicao.length > 0 && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
              <AlertTriangle size={16} className="text-amber-300 shrink-0 mt-0.5" />
              <p className="text-amber-200 text-xs">
                {semPosicao.length} associado(s) sem posição não serão gravados:{' '}
                {semPosicao.map((l) => l.nome).join(', ')}. Se algum deveria correr, volte e preencha a posição.
              </p>
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <button
              onClick={() => setRevisando(false)}
              disabled={salvando}
              className="flex-1 border border-border text-white/70 hover:text-white rounded-xl px-4 py-2.5 transition-colors"
            >
              Voltar e editar
            </button>
            <button
              onClick={confirmarSalvar}
              disabled={salvando}
              className="flex-1 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-colors"
            >
              <Save size={18} />
              {salvando ? 'Salvando...' : 'Confirmar e salvar'}
            </button>
          </div>
          {erro && <p className="mt-3 text-sm text-accent">{erro}</p>}
        </>
      )}
    </section>
  )
}

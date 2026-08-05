'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

const ANO_ATUAL = 2026

async function enderecoDoSite(): Promise<string> {
  const fixo = process.env.NEXT_PUBLIC_SITE_URL
  if (fixo) return fixo.replace(/\/+$/, '')

  const h = await headers()
  const origem = h.get('origin')
  if (origem) return origem

  const host = h.get('host') ?? 'localhost:3000'
  const protocolo = host.startsWith('localhost') ? 'http' : 'https'
  return `${protocolo}://${host}`
}

export async function salvarPiloto(formData: FormData) {
  const supabase = await createClient()

  const id = (formData.get('id') as string | null) || null
  const ativo = formData.get('ativo') === 'true'
  const isAdmin = formData.get('is_admin') === 'true'
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase() || null

  const dados = {
    nome: formData.get('nome') as string,
    idade: formData.get('idade') ? Number(formData.get('idade')) : null,
    numero_kart: formData.get('numero_kart') ? Number(formData.get('numero_kart')) : null,
    cidade: (formData.get('cidade') as string) || null,
    telefone: (formData.get('telefone') as string) || null,
    categoria: (formData.get('categoria') as string) || null,
    estilo_pilotagem: (formData.get('estilo_pilotagem') as string) || null,
    caracteristicas: (formData.get('caracteristicas') as string) || null,
    email,
    is_admin: isAdmin,
    ativo,
  }

  const tipo = (formData.get('tipo') as string) || null
  const peso = formData.get('peso') ? Number(formData.get('peso')) : null

  if (!tipo || peso == null) {
    return { ok: false, mensagem: 'Preencha o peso e o tipo antes de salvar.' }
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, mensagem: 'O e-mail informado nao parece valido.' }
  }

  const foto = formData.get('foto') as File | null
  let fotoUrl: string | null = null
  if (foto && foto.size > 0) {
    const sufixo = Math.random().toString(36).slice(2, 8)
    const nomeLimpo = foto.name.replace(/[^a-zA-Z0-9.]/g, '_')
    const caminho = `${Date.now()}-${sufixo}-${nomeLimpo}`
    const { error: upErro } = await supabase.storage.from('fotos-pilotos').upload(caminho, foto)
    if (!upErro) {
      const { data: pub } = supabase.storage.from('fotos-pilotos').getPublicUrl(caminho)
      fotoUrl = pub.publicUrl
    }
  }

  const { data: campeonato } = await supabase
    .from('campeonatos')
    .select('id')
    .eq('ano', ANO_ATUAL)
    .maybeSingle()

  let pilotoId: string | null = id

  if (id) {
    const patch = fotoUrl ? { ...dados, foto_url: fotoUrl } : dados
    const { error } = await supabase.from('pilotos').update(patch).eq('id', id)
    if (error) return { ok: false, mensagem: `Falha ao salvar piloto: ${error.message}` }
  } else {
    const insert = fotoUrl ? { ...dados, foto_url: fotoUrl } : dados
    const { data: novo, error } = await supabase
      .from('pilotos')
      .insert(insert)
      .select('id')
      .maybeSingle()
    if (error) return { ok: false, mensagem: `Falha ao cadastrar piloto: ${error.message}` }
    pilotoId = novo?.id ?? null
  }

  if (pilotoId && campeonato?.id) {
    const { data: existente } = await supabase
      .from('participacoes')
      .select('id')
      .eq('piloto_id', pilotoId)
      .eq('campeonato_id', campeonato.id)
      .maybeSingle()

    if (existente) {
      const { error } = await supabase
        .from('participacoes')
        .update({ tipo, peso })
        .eq('id', existente.id)
      if (error) return { ok: false, mensagem: `Falha ao salvar peso e tipo: ${error.message}` }
    } else {
      const { error } = await supabase
        .from('participacoes')
        .insert({ piloto_id: pilotoId, campeonato_id: campeonato.id, tipo, peso })
      if (error) return { ok: false, mensagem: `Falha ao criar participacao: ${error.message}` }
    }
  }

  const papel = isAdmin ? 'administrador' : 'piloto'
  let recado = 'Piloto salvo.'

  if (email && pilotoId) {
    const admin = createAdminClient()

    const { data: jaTemConta } = await admin
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (jaTemConta) {
      const { error } = await admin
        .from('usuarios')
        .update({ role: isAdmin ? 'admin' : 'piloto', piloto_id: pilotoId })
        .eq('email', email)

      recado = error
        ? `Piloto salvo, mas nao consegui atualizar o acesso: ${error.message}`
        : `Piloto salvo. ${email} ja tinha conta — acesso atualizado para ${papel}.`
    } else {
      const base = await enderecoDoSite()
      const destino = `${base}/definir-senha`

      const convite = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: destino,
      })

      if (convite.error) {
        recado = `Piloto salvo, mas o convite nao saiu: ${convite.error.message}`
      } else {
        recado = `Piloto salvo. Convite enviado para ${email} apontando para ${destino} — a pessoa cria a senha e entra como ${papel}.`
      }
    }
  }

  revalidatePath('/', 'layout')
  return { ok: true, mensagem: recado }
}

export async function alternarAtivo(id: string, ativo: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('pilotos').update({ ativo: !ativo }).eq('id', id)
  if (error) throw new Error(`Falha ao alterar status: ${error.message}`)
  revalidatePath('/', 'layout')
}

export async function reenviarAcesso(pilotoId: string) {
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: piloto } = await admin
    .from('pilotos')
    .select('email, nome')
    .eq('id', pilotoId)
    .maybeSingle()

  if (!piloto?.email) {
    return { ok: false, mensagem: 'Este piloto nao tem e-mail cadastrado.' }
  }

  const destino = `${await enderecoDoSite()}/definir-senha`

  const { data: temConta } = await admin
    .from('usuarios')
    .select('id')
    .eq('email', piloto.email)
    .maybeSingle()

  if (temConta) {
    const { error } = await supabase.auth.resetPasswordForEmail(piloto.email, {
      redirectTo: destino,
    })
    if (error) return { ok: false, mensagem: `Nao consegui enviar: ${error.message}` }
    return {
      ok: true,
      mensagem: `Link enviado para ${piloto.email}. Ele ja tinha conta, entao recebeu um link para redefinir a senha.`,
    }
  }

  const convite = await admin.auth.admin.inviteUserByEmail(piloto.email, {
    redirectTo: destino,
  })

  if (convite.error) {
    return { ok: false, mensagem: `Nao consegui convidar: ${convite.error.message}` }
  }

  return { ok: true, mensagem: `Convite enviado para ${piloto.email}.` }
}

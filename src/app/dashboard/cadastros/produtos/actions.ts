'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type Estado = { erro?: string; sucesso?: string } | null

function toNum(v: FormDataEntryValue | null) {
  const n = parseFloat(v?.toString() ?? '')
  return isNaN(n) ? null : n
}

export async function criarProdutoAction(_: Estado, formData: FormData): Promise<Estado> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const descricao = formData.get('descricao')?.toString().trim()
  const ncm_codigo = formData.get('ncm_codigo')?.toString().replace(/\D/g, '') ?? ''
  if (!descricao) return { erro: 'Descrição é obrigatória.' }
  if (ncm_codigo.length !== 8) return { erro: 'Código NCM deve ter 8 dígitos.' }

  // Atributos adicionais (pares chave=valor vindos de inputs dinâmicos)
  const atributosJson = formData.get('atributos_json')?.toString() ?? '[]'
  let atributos = []
  try { atributos = JSON.parse(atributosJson) } catch { atributos = [] }

  const { data, error } = await supabase.from('produtos_catalogo').insert({
    user_id: user.id,
    codigo_interno: formData.get('codigo_interno')?.toString().trim() || null,
    descricao,
    descricao_comercial: formData.get('descricao_comercial')?.toString().trim() || null,
    ncm_codigo,
    c_class_trib: formData.get('c_class_trib')?.toString().trim() || null,
    pais_origem: formData.get('pais_origem')?.toString() || null,
    fabricante: formData.get('fabricante')?.toString().trim() || null,
    marca: formData.get('marca')?.toString().trim() || null,
    modelo: formData.get('modelo')?.toString().trim() || null,
    atributos,
    requer_lpco: formData.get('requer_lpco') === 'on',
    orgao_anuente: formData.get('orgao_anuente')?.toString() || null,
    tem_antidumping: formData.get('tem_antidumping') === 'on',
    ex_tarifario: formData.get('ex_tarifario')?.toString().trim() || null,
    unidade_medida: formData.get('unidade_medida')?.toString().trim() || 'UN',
    peso_liquido_kg: toNum(formData.get('peso_liquido_kg')),
    peso_bruto_kg: toNum(formData.get('peso_bruto_kg')),
    observacoes: formData.get('observacoes')?.toString().trim() || null,
  }).select('id').single()

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/cadastros/produtos')
  redirect(`/dashboard/cadastros/produtos/${data.id}`)
}

export async function editarProdutoAction(_: Estado, formData: FormData): Promise<Estado> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id')?.toString()
  const descricao = formData.get('descricao')?.toString().trim()
  const ncm_codigo = formData.get('ncm_codigo')?.toString().replace(/\D/g, '') ?? ''
  if (!id) return { erro: 'ID inválido.' }
  if (!descricao) return { erro: 'Descrição é obrigatória.' }
  if (ncm_codigo.length !== 8) return { erro: 'Código NCM deve ter 8 dígitos.' }

  const atributosJson = formData.get('atributos_json')?.toString() ?? '[]'
  let atributos = []
  try { atributos = JSON.parse(atributosJson) } catch { atributos = [] }

  const { error } = await supabase.from('produtos_catalogo').update({
    codigo_interno: formData.get('codigo_interno')?.toString().trim() || null,
    descricao,
    descricao_comercial: formData.get('descricao_comercial')?.toString().trim() || null,
    ncm_codigo,
    c_class_trib: formData.get('c_class_trib')?.toString().trim() || null,
    pais_origem: formData.get('pais_origem')?.toString() || null,
    fabricante: formData.get('fabricante')?.toString().trim() || null,
    marca: formData.get('marca')?.toString().trim() || null,
    modelo: formData.get('modelo')?.toString().trim() || null,
    atributos,
    requer_lpco: formData.get('requer_lpco') === 'on',
    orgao_anuente: formData.get('orgao_anuente')?.toString() || null,
    tem_antidumping: formData.get('tem_antidumping') === 'on',
    ex_tarifario: formData.get('ex_tarifario')?.toString().trim() || null,
    unidade_medida: formData.get('unidade_medida')?.toString().trim() || 'UN',
    peso_liquido_kg: toNum(formData.get('peso_liquido_kg')),
    peso_bruto_kg: toNum(formData.get('peso_bruto_kg')),
    observacoes: formData.get('observacoes')?.toString().trim() || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/cadastros/produtos')
  revalidatePath(`/dashboard/cadastros/produtos/${id}`)
  return { sucesso: 'Produto atualizado com sucesso!' }
}

export async function excluirProdutoAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('produtos_catalogo').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/dashboard/cadastros/produtos')
  redirect('/dashboard/cadastros/produtos')
}

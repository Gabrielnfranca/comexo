'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function criarFornecedorAction(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const razao_social = formData.get('razao_social')?.toString().trim() ?? ''
  if (!razao_social) return { erro: 'Razão social é obrigatória.' }

  const { error } = await supabase.from('fornecedores').insert({
    user_id: user.id,
    razao_social,
    nome_fantasia: formData.get('nome_fantasia')?.toString().trim() || null,
    pais: formData.get('pais')?.toString().trim() || null,
    cidade: formData.get('cidade')?.toString().trim() || null,
    contato_nome: formData.get('contato_nome')?.toString().trim() || null,
    contato_email: formData.get('contato_email')?.toString().trim() || null,
    contato_telefone: formData.get('contato_telefone')?.toString().trim() || null,
    site: formData.get('site')?.toString().trim() || null,
    observacoes: formData.get('observacoes')?.toString().trim() || null,
  })

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/cadastros/fornecedores')
  redirect('/dashboard/cadastros/fornecedores')
}

export async function editarFornecedorAction(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id')?.toString() ?? ''
  const razao_social = formData.get('razao_social')?.toString().trim() ?? ''
  if (!razao_social) return { erro: 'Razão social é obrigatória.' }

  const { error } = await supabase.from('fornecedores').update({
    razao_social,
    nome_fantasia: formData.get('nome_fantasia')?.toString().trim() || null,
    pais: formData.get('pais')?.toString().trim() || null,
    cidade: formData.get('cidade')?.toString().trim() || null,
    contato_nome: formData.get('contato_nome')?.toString().trim() || null,
    contato_email: formData.get('contato_email')?.toString().trim() || null,
    contato_telefone: formData.get('contato_telefone')?.toString().trim() || null,
    site: formData.get('site')?.toString().trim() || null,
    observacoes: formData.get('observacoes')?.toString().trim() || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/cadastros/fornecedores')
  revalidatePath(`/dashboard/cadastros/fornecedores/${id}`)
  return { sucesso: true }
}

export async function excluirFornecedorAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('fornecedores').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/dashboard/cadastros/fornecedores')
  redirect('/dashboard/cadastros/fornecedores')
}

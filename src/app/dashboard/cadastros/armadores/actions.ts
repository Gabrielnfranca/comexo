'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function criarArmadorAction(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const nome = formData.get('nome')?.toString().trim() ?? ''
  if (!nome) return { erro: 'Nome é obrigatório.' }

  const { error } = await supabase.from('armadores').insert({
    user_id: user.id,
    nome,
    codigo: formData.get('codigo')?.toString().trim() || null,
    modal: formData.get('modal')?.toString() || 'maritimo',
    pais_sede: formData.get('pais_sede')?.toString().trim() || null,
    site: formData.get('site')?.toString().trim() || null,
    observacoes: formData.get('observacoes')?.toString().trim() || null,
  })

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/cadastros/armadores')
  redirect('/dashboard/cadastros/armadores')
}

export async function editarArmadorAction(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id')?.toString() ?? ''
  const nome = formData.get('nome')?.toString().trim() ?? ''
  if (!nome) return { erro: 'Nome é obrigatório.' }

  const { error } = await supabase.from('armadores').update({
    nome,
    codigo: formData.get('codigo')?.toString().trim() || null,
    modal: formData.get('modal')?.toString() || 'maritimo',
    pais_sede: formData.get('pais_sede')?.toString().trim() || null,
    site: formData.get('site')?.toString().trim() || null,
    observacoes: formData.get('observacoes')?.toString().trim() || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/cadastros/armadores')
  revalidatePath(`/dashboard/cadastros/armadores/${id}`)
  return { sucesso: true }
}

export async function excluirArmadorAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('armadores').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/dashboard/cadastros/armadores')
  redirect('/dashboard/cadastros/armadores')
}

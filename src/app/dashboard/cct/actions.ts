'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function criarCCTAction(_: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dados = {
    user_id: user.id,
    numero_conhecimento: formData.get('numero_conhecimento') as string,
    data_chegada: formData.get('data_chegada') as string || null,
    local_chegada: formData.get('local_chegada') as string || null,
    transportadora: formData.get('transportadora') as string || null,
    peso_bruto_kg: formData.get('peso_bruto_kg') ? Number(formData.get('peso_bruto_kg')) : null,
    numero_volumes: formData.get('numero_volumes') ? Number(formData.get('numero_volumes')) : null,
    processo_id: formData.get('processo_id') || null,
    status: formData.get('status') as string || 'aguardando',
    observacoes: formData.get('observacoes') as string || null,
  }

  const { data, error } = await supabase.from('ccts').insert(dados).select().single()
  if (error) return { error: error.message }
  redirect(`/dashboard/cct/${data.id}`)
}

export async function editarCCTAction(_: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  const dados = {
    numero_conhecimento: formData.get('numero_conhecimento') as string,
    data_chegada: formData.get('data_chegada') as string || null,
    local_chegada: formData.get('local_chegada') as string || null,
    transportadora: formData.get('transportadora') as string || null,
    peso_bruto_kg: formData.get('peso_bruto_kg') ? Number(formData.get('peso_bruto_kg')) : null,
    numero_volumes: formData.get('numero_volumes') ? Number(formData.get('numero_volumes')) : null,
    processo_id: formData.get('processo_id') || null,
    status: formData.get('status') as string,
    observacoes: formData.get('observacoes') as string || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('ccts').update(dados).eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/cct/${id}`)
  return { success: true }
}

export async function excluirCCTAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  await supabase.from('ccts').delete().eq('id', id).eq('user_id', user.id)
  redirect('/dashboard/cct')
}

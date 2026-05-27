'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function criarAFFRMAction(_: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const frete_usd = formData.get('valor_frete_usd') ? Number(formData.get('valor_frete_usd')) : null
  const cambio = formData.get('taxa_cambio') ? Number(formData.get('taxa_cambio')) : null
  const frete_brl = frete_usd && cambio ? +(frete_usd * cambio).toFixed(2) : null
  const afrmm = frete_brl ? +(frete_brl * 0.25).toFixed(2) : null

  const dados = {
    user_id: user.id,
    numero_conhecimento: formData.get('numero_conhecimento') as string,
    data_embarque: formData.get('data_embarque') as string || null,
    porto_origem: formData.get('porto_origem') as string || null,
    porto_destino: formData.get('porto_destino') as string || null,
    armador: formData.get('armador') as string || null,
    valor_frete_usd: frete_usd,
    taxa_cambio: cambio,
    valor_frete_brl: frete_brl,
    valor_afrmm_brl: afrmm,
    numero_dpc: formData.get('numero_dpc') as string || null,
    data_vencimento_dpc: formData.get('data_vencimento_dpc') as string || null,
    data_pagamento: formData.get('data_pagamento') as string || null,
    status: formData.get('status') as string || 'pendente',
    processo_id: formData.get('processo_id') || null,
    observacoes: formData.get('observacoes') as string || null,
  }

  const { data, error } = await supabase.from('afrmm_registros').insert(dados).select().single()
  if (error) return { error: error.message }
  redirect(`/dashboard/mercante/${data.id}`)
}

export async function editarAFFRMAction(_: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  const frete_usd = formData.get('valor_frete_usd') ? Number(formData.get('valor_frete_usd')) : null
  const cambio = formData.get('taxa_cambio') ? Number(formData.get('taxa_cambio')) : null
  const frete_brl = frete_usd && cambio ? +(frete_usd * cambio).toFixed(2) : null
  const afrmm = frete_brl ? +(frete_brl * 0.25).toFixed(2) : null

  const dados = {
    numero_conhecimento: formData.get('numero_conhecimento') as string,
    data_embarque: formData.get('data_embarque') as string || null,
    porto_origem: formData.get('porto_origem') as string || null,
    porto_destino: formData.get('porto_destino') as string || null,
    armador: formData.get('armador') as string || null,
    valor_frete_usd: frete_usd,
    taxa_cambio: cambio,
    valor_frete_brl: frete_brl,
    valor_afrmm_brl: afrmm,
    numero_dpc: formData.get('numero_dpc') as string || null,
    data_vencimento_dpc: formData.get('data_vencimento_dpc') as string || null,
    data_pagamento: formData.get('data_pagamento') as string || null,
    status: formData.get('status') as string,
    observacoes: formData.get('observacoes') as string || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('afrmm_registros').update(dados).eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/mercante/${id}`)
  return { success: true }
}

export async function excluirAFFRMAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  await supabase.from('afrmm_registros').delete().eq('id', id).eq('user_id', user.id)
  redirect('/dashboard/mercante')
}

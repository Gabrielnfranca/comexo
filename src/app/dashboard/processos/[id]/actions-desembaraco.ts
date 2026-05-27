'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Salvar dados do desembaraço (canal, DI, datas) ───────────────────────────

export async function salvarDesembaracoAction(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const processoId = formData.get('processo_id')?.toString() ?? ''

  const { error } = await supabase
    .from('processos')
    .update({
      numero_di: formData.get('numero_di')?.toString().trim() || null,
      canal_parametrizacao: formData.get('canal_parametrizacao')?.toString() || null,
      data_registro_di: formData.get('data_registro_di')?.toString() || null,
      data_desembaraco: formData.get('data_desembaraco')?.toString() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', processoId)
    .eq('responsavel_id', user.id)

  if (error) return { erro: error.message }

  revalidatePath(`/dashboard/processos/${processoId}`)
  return { sucesso: true }
}

// ─── Adicionar tributo ─────────────────────────────────────────────────────────

export async function adicionarTributoAction(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const processoId = formData.get('processo_id')?.toString() ?? ''
  const tipo_tributo = formData.get('tipo_tributo')?.toString() ?? ''
  if (!tipo_tributo) return { erro: 'Tipo de tributo é obrigatório.' }

  const toNum = (key: string) => {
    const n = parseFloat(formData.get(key)?.toString() ?? '')
    return isNaN(n) ? null : n
  }

  const { error } = await supabase.from('tributos_di').insert({
    processo_id: processoId,
    tipo_tributo,
    descricao: formData.get('descricao')?.toString().trim() || null,
    base_calculo: toNum('base_calculo'),
    aliquota: toNum('aliquota'),
    valor_calculado: toNum('valor_calculado'),
    valor_pago: toNum('valor_pago'),
    numero_darf: formData.get('numero_darf')?.toString().trim() || null,
    data_pagamento: formData.get('data_pagamento')?.toString() || null,
  })

  if (error) return { erro: error.message }

  revalidatePath(`/dashboard/processos/${processoId}`)
  return { sucesso: true }
}

// ─── Atualizar tributo ─────────────────────────────────────────────────────────

export async function atualizarTributoAction(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id')?.toString() ?? ''
  const processoId = formData.get('processo_id')?.toString() ?? ''

  const toNum = (key: string) => {
    const n = parseFloat(formData.get(key)?.toString() ?? '')
    return isNaN(n) ? null : n
  }

  const { error } = await supabase.from('tributos_di').update({
    descricao: formData.get('descricao')?.toString().trim() || null,
    base_calculo: toNum('base_calculo'),
    aliquota: toNum('aliquota'),
    valor_calculado: toNum('valor_calculado'),
    valor_pago: toNum('valor_pago'),
    numero_darf: formData.get('numero_darf')?.toString().trim() || null,
    data_pagamento: formData.get('data_pagamento')?.toString() || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error) return { erro: error.message }

  revalidatePath(`/dashboard/processos/${processoId}`)
  return { sucesso: true }
}

// ─── Excluir tributo ──────────────────────────────────────────────────────────

export async function excluirTributoAction(id: string, processoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('tributos_di').delete().eq('id', id)

  revalidatePath(`/dashboard/processos/${processoId}`)
}

// ─── Salvar câmbio e valores de frete/seguro ──────────────────────────────────

export async function salvarCambioAction(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const processoId = formData.get('processo_id')?.toString() ?? ''
  const taxa_cambio = formData.get('taxa_cambio')?.toString()
  const valor_frete = formData.get('valor_frete')?.toString()
  const valor_seguro = formData.get('valor_seguro')?.toString()

  const { error } = await supabase
    .from('processos')
    .update({
      taxa_cambio:  taxa_cambio  ? parseFloat(taxa_cambio)  : null,
      valor_frete:  valor_frete  ? parseFloat(valor_frete)  : null,
      valor_seguro: valor_seguro ? parseFloat(valor_seguro) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', processoId)

  if (error) return { erro: error.message }

  revalidatePath(`/dashboard/processos/${processoId}`)
  return { sucesso: true }
}

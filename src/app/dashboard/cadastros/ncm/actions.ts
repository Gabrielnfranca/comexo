'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function criarNcmAction(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const codigo = formData.get('codigo')?.toString().trim().replace(/\D/g, '') ?? ''
  const descricao = formData.get('descricao')?.toString().trim() ?? ''
  if (!codigo || codigo.length !== 8) return { erro: 'Código NCM deve ter 8 dígitos.' }
  if (!descricao) return { erro: 'Descrição é obrigatória.' }

  const toNum = (v: FormDataEntryValue | null) => {
    const n = parseFloat(v?.toString() ?? '')
    return isNaN(n) ? null : n
  }

  const { error } = await supabase.from('ncm_codigos').insert({
    user_id: user.id,
    codigo,
    descricao,
    aliquota_ii: toNum(formData.get('aliquota_ii')),
    aliquota_ipi: toNum(formData.get('aliquota_ipi')),
    aliquota_pis: toNum(formData.get('aliquota_pis')),
    aliquota_cofins: toNum(formData.get('aliquota_cofins')),
    unidade_medida: formData.get('unidade_medida')?.toString().trim() || null,
    c_class_trib: formData.get('c_class_trib')?.toString().trim() || null,
    requer_lpco: formData.get('requer_lpco') === 'on',
    orgao_anuente: formData.get('orgao_anuente')?.toString().trim() || null,
    tem_antidumping: formData.get('tem_antidumping') === 'on',
    ex_tarifario: formData.get('ex_tarifario')?.toString().trim() || null,
    observacoes: formData.get('observacoes')?.toString().trim() || null,
  })

  if (error) {
    if (error.code === '23505') return { erro: 'Já existe um NCM com esse código cadastrado.' }
    return { erro: error.message }
  }

  revalidatePath('/dashboard/cadastros/ncm')
  redirect('/dashboard/cadastros/ncm')
}

export async function editarNcmAction(_: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id')?.toString() ?? ''
  const codigo = formData.get('codigo')?.toString().trim().replace(/\D/g, '') ?? ''
  const descricao = formData.get('descricao')?.toString().trim() ?? ''
  if (!codigo || codigo.length !== 8) return { erro: 'Código NCM deve ter 8 dígitos.' }
  if (!descricao) return { erro: 'Descrição é obrigatória.' }

  const toNum = (v: FormDataEntryValue | null) => {
    const n = parseFloat(v?.toString() ?? '')
    return isNaN(n) ? null : n
  }

  const { error } = await supabase.from('ncm_codigos').update({
    codigo,
    descricao,
    aliquota_ii: toNum(formData.get('aliquota_ii')),
    aliquota_ipi: toNum(formData.get('aliquota_ipi')),
    aliquota_pis: toNum(formData.get('aliquota_pis')),
    aliquota_cofins: toNum(formData.get('aliquota_cofins')),
    unidade_medida: formData.get('unidade_medida')?.toString().trim() || null,
    c_class_trib: formData.get('c_class_trib')?.toString().trim() || null,
    requer_lpco: formData.get('requer_lpco') === 'on',
    orgao_anuente: formData.get('orgao_anuente')?.toString().trim() || null,
    tem_antidumping: formData.get('tem_antidumping') === 'on',
    ex_tarifario: formData.get('ex_tarifario')?.toString().trim() || null,
    observacoes: formData.get('observacoes')?.toString().trim() || null,
    updated_at: new Date().toISOString(),
  }).eq('id', id).eq('user_id', user.id)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/cadastros/ncm')
  revalidatePath(`/dashboard/cadastros/ncm/${id}`)
  return { sucesso: true }
}

export async function excluirNcmAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('ncm_codigos').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/dashboard/cadastros/ncm')
  redirect('/dashboard/cadastros/ncm')
}

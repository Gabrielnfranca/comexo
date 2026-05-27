'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { LpcoStatus } from '@/lib/types/lpco'

type Estado = { erro?: string; sucesso?: string } | null

function buildPayload(formData: FormData) {
  const toNum = (v: FormDataEntryValue | null) => {
    const n = parseFloat(v?.toString() ?? '')
    return isNaN(n) ? null : n
  }
  return {
    numero_lpco: formData.get('numero_lpco')?.toString().trim() || null,
    tipo_licenca: formData.get('tipo_licenca')?.toString() || 'lpco',
    orgao_anuente: formData.get('orgao_anuente')?.toString() ?? '',
    ncm_codigo: formData.get('ncm_codigo')?.toString().replace(/\D/g, '') || null,
    descricao_mercadoria: formData.get('descricao_mercadoria')?.toString().trim() || null,
    status: (formData.get('status')?.toString() ?? 'rascunho') as LpcoStatus,
    data_solicitacao: formData.get('data_solicitacao')?.toString() || null,
    data_aprovacao: formData.get('data_aprovacao')?.toString() || null,
    data_validade: formData.get('data_validade')?.toString() || null,
    quantidade: toNum(formData.get('quantidade')),
    unidade_medida: formData.get('unidade_medida')?.toString() || null,
    valor_usd: toNum(formData.get('valor_usd')),
    importador_cnpj: formData.get('importador_cnpj')?.toString().trim() || null,
    importador_nome: formData.get('importador_nome')?.toString().trim() || null,
    exportador_nome: formData.get('exportador_nome')?.toString().trim() || null,
    pais_origem: formData.get('pais_origem')?.toString() || null,
    numero_di: formData.get('numero_di')?.toString().trim() || null,
    observacoes: formData.get('observacoes')?.toString().trim() || null,
  }
}

export async function criarLpcoAction(_: Estado, formData: FormData): Promise<Estado> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!formData.get('orgao_anuente')?.toString()) return { erro: 'Órgão Anuente é obrigatório.' }

  const { data, error } = await supabase
    .from('lpco_registros')
    .insert({ ...buildPayload(formData), user_id: user.id })
    .select('id').single()

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/lpco')
  redirect(`/dashboard/lpco/${data.id}`)
}

export async function editarLpcoAction(_: Estado, formData: FormData): Promise<Estado> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id')?.toString()
  if (!id) return { erro: 'ID inválido.' }

  const { error } = await supabase
    .from('lpco_registros')
    .update({ ...buildPayload(formData), updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', user.id)

  if (error) return { erro: error.message }

  revalidatePath('/dashboard/lpco')
  revalidatePath(`/dashboard/lpco/${id}`)
  return { sucesso: 'LPCO atualizado com sucesso!' }
}

export async function excluirLpcoAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('lpco_registros').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/dashboard/lpco')
  redirect('/dashboard/lpco')
}

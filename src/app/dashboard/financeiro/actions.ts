'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type EstadoLancamento = { erro?: string; sucesso?: string }

// ─── Criar lançamento ─────────────────────────────────────────────────────────
export async function criarLancamentoAction(
  _prev: EstadoLancamento,
  formData: FormData,
): Promise<EstadoLancamento> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: 'Não autenticado.' }

  const descricao = formData.get('descricao')?.toString().trim()
  const valor = parseFloat(formData.get('valor')?.toString() ?? '0')

  if (!descricao) return { erro: 'Descrição é obrigatória.' }
  if (isNaN(valor) || valor <= 0) return { erro: 'Valor inválido.' }

  const payload = {
    user_id:     user.id,
    processo_id: formData.get('processo_id')?.toString() || null,
    tipo:        formData.get('tipo')?.toString() || 'despesa',
    categoria:   formData.get('categoria')?.toString() || 'outros',
    descricao,
    valor,
    moeda:       formData.get('moeda')?.toString() || 'BRL',
    status:      'pendente',
    vencimento:  formData.get('vencimento')?.toString() || null,
    observacoes: formData.get('observacoes')?.toString().trim() || null,
  }

  const { error } = await supabase.from('lancamentos_financeiros').insert(payload)
  if (error) return { erro: error.message }

  const processoId = payload.processo_id
  revalidatePath('/dashboard/financeiro')
  if (processoId) revalidatePath(`/dashboard/processos/${processoId}`)

  return { sucesso: 'Lançamento criado com sucesso!' }
}

// ─── Marcar como pago ─────────────────────────────────────────────────────────
export async function marcarPagoAction(id: string, processoId?: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('lancamentos_financeiros')
    .update({ status: 'pago', pagamento: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/dashboard/financeiro')
  if (processoId) revalidatePath(`/dashboard/processos/${processoId}`)
}

// ─── Cancelar lançamento ──────────────────────────────────────────────────────
export async function cancelarLancamentoAction(id: string, processoId?: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('lancamentos_financeiros')
    .update({ status: 'cancelado', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/dashboard/financeiro')
  if (processoId) revalidatePath(`/dashboard/processos/${processoId}`)
}

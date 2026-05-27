'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ── Schemas ────────────────────────────────────────────────────────────────

const FictaSchema = z.object({
  numero_operacao:        z.string().min(1, 'Número da operação obrigatório'),
  tipo:                   z.enum(['zfm', 'zpe', 'recof', 'drawback_fornecedor', 'outros']),
  cliente:                z.string().min(1, 'Cliente obrigatório'),
  cnpj_cliente:           z.string().optional(),
  descricao_mercadoria:   z.string().optional(),
  ncm:                    z.string().optional(),
  quantidade:             z.string().optional(),
  unidade:                z.string().optional(),
  valor_nf:               z.string().optional(),
  moeda:                  z.string().default('BRL'),
  numero_nf:              z.string().optional(),
  data_nf:                z.string().optional(),
  numero_due:             z.string().optional(),
  data_due:               z.string().optional(),
  beneficio_fiscal:       z.string().optional(),
  valor_beneficio_fiscal: z.string().optional(),
  referencia_interna:     z.string().optional(),
  observacoes:            z.string().optional(),
})

// ── Criar ──────────────────────────────────────────────────────────────────

export async function criarFictaAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const raw = Object.fromEntries(formData)
  const parsed = FictaSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const d = parsed.data

  const { data, error } = await supabase
    .from('operacoes_fictas')
    .insert({
      user_id:             user.id,
      numero_operacao:     d.numero_operacao,
      tipo:                d.tipo,
      status:              'aberta',
      cliente:             d.cliente,
      cnpj_cliente:        d.cnpj_cliente || null,
      descricao_mercadoria: d.descricao_mercadoria || null,
      ncm:                 d.ncm || null,
      quantidade:          d.quantidade ? parseFloat(d.quantidade) : null,
      unidade:             d.unidade || null,
      valor_nf:            d.valor_nf ? parseFloat(d.valor_nf) : null,
      moeda:               d.moeda || 'BRL',
      numero_nf:           d.numero_nf || null,
      data_nf:             d.data_nf || null,
      numero_due:          d.numero_due || null,
      data_due:            d.data_due || null,
      beneficio_fiscal:    d.beneficio_fiscal || null,
      valor_beneficio_fiscal: d.valor_beneficio_fiscal ? parseFloat(d.valor_beneficio_fiscal) : null,
      referencia_interna:  d.referencia_interna || null,
      observacoes:         d.observacoes || null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  redirect(`/dashboard/ficta/${data.id}`)
}

// ── Editar ─────────────────────────────────────────────────────────────────

export async function editarFictaAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const id = formData.get('id') as string
  const raw = Object.fromEntries(formData)
  const parsed = FictaSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const d = parsed.data

  const { error } = await supabase
    .from('operacoes_fictas')
    .update({
      numero_operacao:     d.numero_operacao,
      tipo:                d.tipo,
      cliente:             d.cliente,
      cnpj_cliente:        d.cnpj_cliente || null,
      descricao_mercadoria: d.descricao_mercadoria || null,
      ncm:                 d.ncm || null,
      quantidade:          d.quantidade ? parseFloat(d.quantidade) : null,
      unidade:             d.unidade || null,
      valor_nf:            d.valor_nf ? parseFloat(d.valor_nf) : null,
      moeda:               d.moeda || 'BRL',
      numero_nf:           d.numero_nf || null,
      data_nf:             d.data_nf || null,
      numero_due:          d.numero_due || null,
      data_due:            d.data_due || null,
      beneficio_fiscal:    d.beneficio_fiscal || null,
      valor_beneficio_fiscal: d.valor_beneficio_fiscal ? parseFloat(d.valor_beneficio_fiscal) : null,
      referencia_interna:  d.referencia_interna || null,
      observacoes:         d.observacoes || null,
      updated_at:          new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/ficta/${id}`)
  return { success: true }
}

// ── Atualizar status ───────────────────────────────────────────────────────

export async function atualizarStatusFictaAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const id     = formData.get('id') as string
  const status = formData.get('status') as string

  const { error } = await supabase
    .from('operacoes_fictas')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/ficta/${id}`)
  return { success: true }
}

// ── Registrar comprovação ──────────────────────────────────────────────────

export async function registrarComprovacaoAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const id                     = formData.get('id') as string
  const comprovante_internamento = formData.get('comprovante_internamento') as string
  const data_comprovacao       = formData.get('data_comprovacao') as string

  if (!data_comprovacao) return { error: 'Data de comprovação obrigatória' }

  const { error } = await supabase
    .from('operacoes_fictas')
    .update({
      comprovante_internamento: comprovante_internamento || null,
      data_comprovacao,
      status:     'comprovada',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/ficta/${id}`)
  return { success: true }
}

// ── Excluir ────────────────────────────────────────────────────────────────

export async function excluirFictaAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('operacoes_fictas')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  redirect('/dashboard/ficta')
}

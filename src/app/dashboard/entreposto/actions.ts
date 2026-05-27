'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { calcularDataLimite } from '@/lib/types/entreposto'

// ── Criar Lote ────────────────────────────────────────────────────────────────

const LoteSchema = z.object({
  numero_lote:          z.string().min(1, 'Número do lote obrigatório'),
  tipo:                 z.enum(['importacao', 'exportacao']),
  regime:               z.enum(['comum', 'especial', 'industrial']).default('comum'),
  beneficiario:         z.string().min(1, 'Beneficiário obrigatório'),
  descricao_mercadoria: z.string().optional(),
  ncm:                  z.string().optional(),
  quantidade:           z.string().optional(),
  unidade:              z.string().optional(),
  valor_aduaneiro:      z.string().optional(),
  moeda:                z.string().default('USD'),
  data_entrada:         z.string().min(1, 'Data de entrada obrigatória'),
  prazo_meses:          z.coerce.number().default(12),
  recinto_aduaneiro:    z.string().optional(),
  numero_dacta:         z.string().optional(),
  observacoes:          z.string().optional(),
})

export async function criarEntrepostoAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const raw = Object.fromEntries(formData)
  const parsed = LoteSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const d = parsed.data
  const data_limite = calcularDataLimite(d.data_entrada, d.prazo_meses)

  const { data, error } = await supabase.from('entreposto_lotes').insert({
    user_id:              user.id,
    numero_lote:          d.numero_lote,
    tipo:                 d.tipo,
    regime:               d.regime,
    beneficiario:         d.beneficiario,
    descricao_mercadoria: d.descricao_mercadoria || null,
    ncm:                  d.ncm || null,
    quantidade:           d.quantidade ? parseFloat(d.quantidade) : null,
    unidade:              d.unidade || null,
    valor_aduaneiro:      d.valor_aduaneiro ? parseFloat(d.valor_aduaneiro) : null,
    moeda:                d.moeda,
    data_entrada:         d.data_entrada,
    prazo_meses:          d.prazo_meses,
    data_limite,
    recinto_aduaneiro:    d.recinto_aduaneiro || null,
    numero_dacta:         d.numero_dacta || null,
    observacoes:          d.observacoes || null,
    status:               'armazenado',
  }).select('id').single()

  if (error) return { error: error.message }
  redirect(`/dashboard/entreposto/${data.id}`)
}

// ── Editar Lote ───────────────────────────────────────────────────────────────

const EditLoteSchema = LoteSchema.extend({
  id:     z.string().uuid(),
  status: z.enum(['armazenado','desembaracado','reexportado','destruido','abandonado','vencido']).default('armazenado'),
})

export async function editarEntrepostoAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const raw = Object.fromEntries(formData)
  const parsed = EditLoteSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const d = parsed.data
  const data_limite = calcularDataLimite(d.data_entrada, d.prazo_meses)

  const { error } = await supabase.from('entreposto_lotes').update({
    numero_lote:          d.numero_lote,
    tipo:                 d.tipo,
    regime:               d.regime,
    beneficiario:         d.beneficiario,
    status:               d.status,
    descricao_mercadoria: d.descricao_mercadoria || null,
    ncm:                  d.ncm || null,
    quantidade:           d.quantidade ? parseFloat(d.quantidade) : null,
    unidade:              d.unidade || null,
    valor_aduaneiro:      d.valor_aduaneiro ? parseFloat(d.valor_aduaneiro) : null,
    moeda:                d.moeda,
    data_entrada:         d.data_entrada,
    prazo_meses:          d.prazo_meses,
    data_limite,
    recinto_aduaneiro:    d.recinto_aduaneiro || null,
    numero_dacta:         d.numero_dacta || null,
    observacoes:          d.observacoes || null,
    updated_at:           new Date().toISOString(),
  }).eq('id', d.id).eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/entreposto/${d.id}`)
  revalidatePath('/dashboard/entreposto')
  return { success: true }
}

// ── Registrar Saída ───────────────────────────────────────────────────────────

const SaidaSchema = z.object({
  id:          z.string().uuid(),
  data_saida:  z.string().min(1, 'Data de saída obrigatória'),
  tipo_saida:  z.enum(['desembaraco', 'reexportacao', 'destruicao', 'abandono']),
  observacoes: z.string().optional(),
})

const STATUS_SAIDA: Record<string, string> = {
  desembaraco:  'desembaracado',
  reexportacao: 'reexportado',
  destruicao:   'destruido',
  abandono:     'abandonado',
}

export async function registrarSaidaAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const raw = Object.fromEntries(formData)
  const parsed = SaidaSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const d = parsed.data
  const { error } = await supabase.from('entreposto_lotes').update({
    data_saida:  d.data_saida,
    tipo_saida:  d.tipo_saida,
    status:      STATUS_SAIDA[d.tipo_saida],
    observacoes: d.observacoes || null,
    updated_at:  new Date().toISOString(),
  }).eq('id', d.id).eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/entreposto/${d.id}`)
  revalidatePath('/dashboard/entreposto')
  return { success: true }
}

// ── Excluir Lote ──────────────────────────────────────────────────────────────

export async function excluirEntrepostoAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('entreposto_lotes').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/entreposto')
  redirect('/dashboard/entreposto')
}

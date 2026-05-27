'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ── Criar Ato Concessório ─────────────────────────────────────────────────────

const AtoSchema = z.object({
  numero_ato:         z.string().min(1, 'Número do ato obrigatório'),
  modalidade:         z.enum(['suspensao', 'isencao', 'restituicao']),
  cliente:            z.string().min(1, 'Cliente obrigatório'),
  data_concessao:     z.string().optional(),
  data_vencimento:    z.string().optional(),
  prazo_meses:        z.coerce.number().default(12),
  valor_fob_exportar: z.string().optional(),
  referencia_interna: z.string().optional(),
  observacoes:        z.string().optional(),
})

export async function criarDrawbackAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const raw = Object.fromEntries(formData)
  const parsed = AtoSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }
  }

  const d = parsed.data
  const { data, error } = await supabase
    .from('drawback_atos')
    .insert({
      user_id:            user.id,
      numero_ato:         d.numero_ato,
      modalidade:         d.modalidade,
      cliente:            d.cliente,
      data_concessao:     d.data_concessao || null,
      data_vencimento:    d.data_vencimento || null,
      prazo_meses:        d.prazo_meses,
      valor_fob_exportar: d.valor_fob_exportar ? parseFloat(d.valor_fob_exportar) : null,
      referencia_interna: d.referencia_interna || null,
      observacoes:        d.observacoes || null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  redirect(`/dashboard/drawback/${data.id}`)
}

// ── Editar Ato ────────────────────────────────────────────────────────────────

const EditAtoSchema = AtoSchema.extend({
  id:     z.string().uuid(),
  status: z.enum(['vigente', 'vencido', 'prorrogado', 'comprovado', 'cancelado']).default('vigente'),
})

export async function editarDrawbackAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const raw = Object.fromEntries(formData)
  const parsed = EditAtoSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }

  const d = parsed.data
  const { error } = await supabase
    .from('drawback_atos')
    .update({
      numero_ato:         d.numero_ato,
      modalidade:         d.modalidade,
      cliente:            d.cliente,
      status:             d.status,
      data_concessao:     d.data_concessao || null,
      data_vencimento:    d.data_vencimento || null,
      prazo_meses:        d.prazo_meses,
      valor_fob_exportar: d.valor_fob_exportar ? parseFloat(d.valor_fob_exportar) : null,
      referencia_interna: d.referencia_interna || null,
      observacoes:        d.observacoes || null,
      updated_at:         new Date().toISOString(),
    })
    .eq('id', d.id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/drawback/${d.id}`)
  revalidatePath('/dashboard/drawback')
  return { success: true }
}

// ── Adicionar Insumo ──────────────────────────────────────────────────────────

const InsumoSchema = z.object({
  ato_id:               z.string().uuid(),
  descricao:            z.string().min(1, 'Descrição obrigatória'),
  ncm:                  z.string().optional(),
  unidade:              z.string().optional(),
  quantidade_autorizada: z.string().optional(),
  quantidade_utilizada:  z.string().optional(),
  valor_unitario_fob:   z.string().optional(),
  ii_suspenso:          z.string().optional(),
  ipi_suspenso:         z.string().optional(),
  pis_suspenso:         z.string().optional(),
  cofins_suspenso:      z.string().optional(),
})

function num(v: string | undefined) {
  if (!v || v.trim() === '') return 0
  return parseFloat(v) || 0
}

function numNull(v: string | undefined) {
  if (!v || v.trim() === '') return null
  return parseFloat(v) || null
}

export async function adicionarInsumoAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const raw = Object.fromEntries(formData)
  const parsed = InsumoSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }

  const d = parsed.data
  const { error } = await supabase.from('drawback_insumos').insert({
    ato_id:               d.ato_id,
    user_id:              user.id,
    descricao:            d.descricao,
    ncm:                  d.ncm || null,
    unidade:              d.unidade || null,
    quantidade_autorizada: numNull(d.quantidade_autorizada),
    quantidade_utilizada:  num(d.quantidade_utilizada),
    valor_unitario_fob:   numNull(d.valor_unitario_fob),
    ii_suspenso:          num(d.ii_suspenso),
    ipi_suspenso:         num(d.ipi_suspenso),
    pis_suspenso:         num(d.pis_suspenso),
    cofins_suspenso:      num(d.cofins_suspenso),
  })

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/drawback/${d.ato_id}`)
  return { success: true }
}

export async function editarInsumoAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const id = formData.get('id') as string
  const ato_id = formData.get('ato_id') as string
  const d = InsumoSchema.parse({ ...Object.fromEntries(formData), ato_id })

  const { error } = await supabase.from('drawback_insumos').update({
    descricao:            d.descricao,
    ncm:                  d.ncm || null,
    unidade:              d.unidade || null,
    quantidade_autorizada: numNull(d.quantidade_autorizada),
    quantidade_utilizada:  num(d.quantidade_utilizada),
    valor_unitario_fob:   numNull(d.valor_unitario_fob),
    ii_suspenso:          num(d.ii_suspenso),
    ipi_suspenso:         num(d.ipi_suspenso),
    pis_suspenso:         num(d.pis_suspenso),
    cofins_suspenso:      num(d.cofins_suspenso),
  }).eq('id', id).eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/drawback/${ato_id}`)
  return { success: true }
}

export async function excluirInsumoAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const id = formData.get('id') as string
  const ato_id = formData.get('ato_id') as string
  const { error } = await supabase.from('drawback_insumos').delete().eq('id', id).eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/drawback/${ato_id}`)
  return { success: true }
}

// ── Exportações ───────────────────────────────────────────────────────────────

const ExportacaoSchema = z.object({
  ato_id:              z.string().uuid(),
  numero_due:          z.string().optional(),
  data_embarque:       z.string().optional(),
  valor_fob_exportado: z.string().optional(),
  mercadoria:          z.string().optional(),
  observacoes:         z.string().optional(),
})

export async function adicionarExportacaoAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const raw = Object.fromEntries(formData)
  const parsed = ExportacaoSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }

  const d = parsed.data
  const valor = d.valor_fob_exportado ? parseFloat(d.valor_fob_exportado) : null

  // Insere exportação
  const { error } = await supabase.from('drawback_exportacoes').insert({
    ato_id:              d.ato_id,
    user_id:             user.id,
    numero_due:          d.numero_due || null,
    data_embarque:       d.data_embarque || null,
    valor_fob_exportado: valor,
    mercadoria:          d.mercadoria || null,
    observacoes:         d.observacoes || null,
  })
  if (error) return { error: error.message }

  // Atualiza valor_fob_exportado no ato (soma acumulada)
  if (valor) {
    const { data: ato } = await supabase
      .from('drawback_atos')
      .select('valor_fob_exportado')
      .eq('id', d.ato_id)
      .single()

    if (ato) {
      await supabase.from('drawback_atos').update({
        valor_fob_exportado: (ato.valor_fob_exportado ?? 0) + valor,
        updated_at: new Date().toISOString(),
      }).eq('id', d.ato_id)
    }
  }

  revalidatePath(`/dashboard/drawback/${d.ato_id}`)
  return { success: true }
}

export async function excluirExportacaoAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const id = formData.get('id') as string
  const ato_id = formData.get('ato_id') as string

  // Busca o valor antes de excluir
  const { data: exp } = await supabase
    .from('drawback_exportacoes')
    .select('valor_fob_exportado')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('drawback_exportacoes').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  // Subtrai do ato
  if (exp?.valor_fob_exportado) {
    const { data: ato } = await supabase
      .from('drawback_atos')
      .select('valor_fob_exportado')
      .eq('id', ato_id)
      .single()
    if (ato) {
      await supabase.from('drawback_atos').update({
        valor_fob_exportado: Math.max(0, (ato.valor_fob_exportado ?? 0) - exp.valor_fob_exportado),
        updated_at: new Date().toISOString(),
      }).eq('id', ato_id)
    }
  }

  revalidatePath(`/dashboard/drawback/${ato_id}`)
  return { success: true }
}

// ── Excluir Ato ────────────────────────────────────────────────────────────────

export async function excluirDrawbackAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('drawback_atos').delete().eq('id', id).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/drawback')
  redirect('/dashboard/drawback')
}

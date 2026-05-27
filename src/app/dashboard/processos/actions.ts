'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getNumeroPrefixo } from '@/lib/types/processo'

const ProcessoSchema = z.object({
  tipo: z.enum(['importacao', 'exportacao']),
  modal: z.preprocess(v => v === '' ? undefined : v, z.enum(['maritimo', 'aereo', 'rodoviario', 'ferroviario']).optional()),
  cliente: z.string().min(2, 'Nome do cliente é obrigatório'),
  mercadoria: z.string().optional(),
  // importação
  fornecedor: z.string().optional(),
  numero_di: z.string().optional(),
  canal_parametrizacao: z.string().optional(),
  data_registro_di: z.string().optional(),
  // exportação
  numero_due: z.string().optional(),
  numero_re: z.string().optional(),
  // transporte
  armador: z.string().optional(),
  companhia_aerea: z.string().optional(),
  numero_bl_awb: z.string().optional(),
  container_tipo: z.string().optional(),
  container_numero: z.string().optional(),
  // carga
  ncm: z.string().optional(),
  numero_invoice: z.string().optional(),
  peso_bruto: z.string().optional(),
  valor_fob: z.string().optional(),
  moeda: z.string().default('USD'),
  // rota
  pais_origem: z.string().optional(),
  pais_destino: z.string().optional(),
  porto_embarque: z.string().optional(),
  porto_destino: z.string().optional(),
  previsao_chegada: z.string().optional(),
  observacoes: z.string().optional(),
})

type FormState = { error?: string } | null

export async function criarProcessoAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData)
  const parse = ProcessoSchema.safeParse(raw)

  if (!parse.success) {
    const firstError = Object.values(parse.error.flatten().fieldErrors)[0]?.[0]
    return { error: firstError ?? 'Dados inválidos' }
  }

  const d = parse.data
  const modalValido = d.modal ?? null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const ano = new Date().getFullYear()
  const prefixo = getNumeroPrefixo(d.tipo, modalValido ?? undefined)

  const { count } = await supabase
    .from('processos')
    .select('*', { count: 'exact', head: true })
    .eq('tipo', d.tipo)
    .eq('modal', modalValido ?? '')

  const seq = String((count ?? 0) + 1).padStart(4, '0')
  const numero = `${prefixo}-${ano}-${seq}`

  const { data, error } = await supabase
    .from('processos')
    .insert({
      numero,
      tipo: d.tipo,
      modal: modalValido,
      status: 'aberto',
      cliente: d.cliente,
      mercadoria: d.mercadoria || null,
      fornecedor: d.fornecedor || null,
      numero_di: d.numero_di || null,
      canal_parametrizacao: d.canal_parametrizacao || null,
      data_registro_di: d.data_registro_di || null,
      numero_due: d.numero_due || null,
      numero_re: d.numero_re || null,
      armador: d.armador || null,
      companhia_aerea: d.companhia_aerea || null,
      numero_bl_awb: d.numero_bl_awb || null,
      container_tipo: d.container_tipo || null,
      container_numero: d.container_numero || null,
      ncm: d.ncm?.replace(/\D/g, '') || null,
      numero_invoice: d.numero_invoice || null,
      peso_bruto: d.peso_bruto ? parseFloat(d.peso_bruto) : null,
      valor_fob: d.valor_fob ? parseFloat(d.valor_fob) : null,
      moeda: d.moeda || 'USD',
      pais_origem: d.pais_origem || null,
      pais_destino: d.pais_destino || null,
      porto_embarque: d.porto_embarque || null,
      porto_destino: d.porto_destino || null,
      previsao_chegada: d.previsao_chegada || null,
      observacoes: d.observacoes || null,
      responsavel_id: user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard/processos')
  redirect(`/dashboard/processos/${data.id}`)
}

export async function atualizarStatusAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const observacao = (formData.get('observacao') as string | null)?.trim() || null

  if (!id || !status) return { error: 'Dados inválidos' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Buscar status atual para registrar a transição
  const { data: processo } = await supabase
    .from('processos')
    .select('status, numero')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('processos')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  // Registrar na timeline
  const { STATUS_LABELS } = await import('@/lib/types/processo')
  await supabase.from('processo_timeline').insert({
    processo_id: id,
    usuario_id:  user?.id ?? null,
    evento:      'status_alterado',
    descricao:   observacao
      ?? `Status atualizado: ${STATUS_LABELS[processo?.status as keyof typeof STATUS_LABELS] ?? processo?.status} → ${STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status}`,
    dados: {
      status_anterior: processo?.status ?? null,
      status_novo:     status,
      usuario_email:   user?.email ?? null,
    },
    visivel_cliente: true,
  })

  revalidatePath('/dashboard/processos')
  revalidatePath(`/dashboard/processos/${id}`)
  return null
}

export async function adicionarComentarioAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const id = formData.get('id') as string
  const texto = (formData.get('texto') as string | null)?.trim()
  const visivelCliente = formData.get('visivel_cliente') === 'true'

  if (!id || !texto) return { error: 'Comentário não pode ser vazio.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('processo_timeline').insert({
    processo_id:     id,
    usuario_id:      user.id,
    evento:          'comentario',
    descricao:       texto,
    dados:           { usuario_email: user.email },
    visivel_cliente: visivelCliente,
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/processos/${id}`)
  return null
}

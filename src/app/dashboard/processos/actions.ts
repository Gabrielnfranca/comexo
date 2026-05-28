'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getNumeroPrefixo } from '@/lib/types/processo'

const ProcessoSchema = z.object({
  tipo: z.enum(['importacao', 'exportacao']),
  modal: z.preprocess(v => v === '' ? undefined : v, z.enum(['maritimo', 'aereo', 'rodoviario', 'ferroviario']).optional()),
  // partes
  cliente: z.string().min(2, 'Nome do cliente é obrigatório'),
  cnpj_importador: z.string().optional(),
  fornecedor: z.string().optional(),
  fabricante: z.string().optional(),
  pais_fabricante: z.string().optional(),
  // mercadoria
  mercadoria: z.string().optional(),
  ncm: z.string().optional(),
  incoterm: z.string().optional(),
  numero_invoice: z.string().optional(),
  // valores
  valor_fob: z.string().optional(),
  moeda: z.string().default('USD'),
  valor_frete: z.string().optional(),
  moeda_frete: z.string().default('USD'),
  frete_collect: z.preprocess(v => v === 'true' || v === 'on', z.boolean()).optional(),
  valor_seguro: z.string().optional(),
  seguro_tipo: z.string().default('valor'),
  taxa_cambio: z.string().optional(),
  // carga
  peso_bruto: z.string().optional(),
  peso_taxado: z.string().optional(),
  // transporte marítimo
  armador: z.string().optional(),
  numero_bl_awb: z.string().optional(),
  container_tipo: z.string().optional(),
  container_numero: z.string().optional(),
  ce_mercante: z.string().optional(),
  // transporte aéreo
  companhia_aerea: z.string().optional(),
  ruc: z.string().optional(),
  // logística interna
  transportadora: z.string().optional(),
  // rota
  pais_origem: z.string().optional(),
  pais_destino: z.string().optional(),
  porto_embarque: z.string().optional(),
  porto_destino: z.string().optional(),
  previsao_chegada: z.string().optional(),
  // despacho
  despachante: z.string().optional(),
  recinto: z.string().optional(),
  documento_despacho: z.string().optional(),
  // importação
  numero_di: z.string().optional(),
  canal_parametrizacao: z.string().optional(),
  data_registro_di: z.string().optional(),
  // exportação
  numero_due: z.string().optional(),
  numero_re: z.string().optional(),
  // impostos
  ii_percentual: z.string().optional(),
  ipi_percentual: z.string().optional(),
  pis_percentual: z.string().optional(),
  cofins_percentual: z.string().optional(),
  icms_percentual: z.string().optional(),
  afrmm_valor: z.string().optional(),
  // itens
  itens_descricao: z.string().optional(),
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
      // partes
      cliente: d.cliente,
      cnpj_importador: d.cnpj_importador || null,
      fornecedor: d.fornecedor || null,
      fabricante: d.fabricante || null,
      pais_fabricante: d.pais_fabricante || null,
      // mercadoria
      mercadoria: d.mercadoria || null,
      ncm: d.ncm?.replace(/\D/g, '') || null,
      incoterm: d.incoterm || null,
      numero_invoice: d.numero_invoice || null,
      // valores
      valor_fob: d.valor_fob ? parseFloat(d.valor_fob) : null,
      moeda: d.moeda || 'USD',
      valor_frete: d.valor_frete ? parseFloat(d.valor_frete) : null,
      moeda_frete: d.moeda_frete || 'USD',
      frete_collect: d.frete_collect ?? false,
      valor_seguro: d.valor_seguro ? parseFloat(d.valor_seguro) : null,
      seguro_tipo: d.seguro_tipo || 'valor',
      taxa_cambio: d.taxa_cambio ? parseFloat(d.taxa_cambio) : null,
      // carga
      peso_bruto: d.peso_bruto ? parseFloat(d.peso_bruto) : null,
      peso_taxado: d.peso_taxado ? parseFloat(d.peso_taxado) : null,
      // transporte marítimo
      armador: d.armador || null,
      numero_bl_awb: d.numero_bl_awb || null,
      container_tipo: d.container_tipo || null,
      container_numero: d.container_numero || null,
      ce_mercante: d.ce_mercante || null,
      // transporte aéreo
      companhia_aerea: d.companhia_aerea || null,
      ruc: d.ruc || null,
      // logística interna
      transportadora: d.transportadora || null,
      // rota
      pais_origem: d.pais_origem || null,
      pais_destino: d.pais_destino || null,
      porto_embarque: d.porto_embarque || null,
      porto_destino: d.porto_destino || null,
      previsao_chegada: d.previsao_chegada || null,
      // despacho
      despachante: d.despachante || null,
      recinto: d.recinto || null,
      documento_despacho: d.documento_despacho || null,
      // importação
      numero_di: d.numero_di || null,
      canal_parametrizacao: d.canal_parametrizacao || null,
      data_registro_di: d.data_registro_di || null,
      // exportação
      numero_due: d.numero_due || null,
      numero_re: d.numero_re || null,
      // impostos
      ii_percentual: d.ii_percentual ? parseFloat(d.ii_percentual) : null,
      ipi_percentual: d.ipi_percentual ? parseFloat(d.ipi_percentual) : null,
      pis_percentual: d.pis_percentual ? parseFloat(d.pis_percentual) : null,
      cofins_percentual: d.cofins_percentual ? parseFloat(d.cofins_percentual) : null,
      icms_percentual: d.icms_percentual ? parseFloat(d.icms_percentual) : null,
      afrmm_valor: d.afrmm_valor ? parseFloat(d.afrmm_valor) : null,
      // itens
      itens_descricao: d.itens_descricao || null,
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

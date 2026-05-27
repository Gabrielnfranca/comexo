'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { templateAlertaDrawback, templateAlertaEntreposto } from '@/lib/email/templates'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function diffDias(dataStr: string): number {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const alvo = new Date(dataStr)
  alvo.setHours(0, 0, 0, 0)
  return Math.ceil((alvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

function formatarData(dataStr: string): string {
  return new Date(dataStr).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

// ── Buscar alertas ─────────────────────────────────────────────────────────

export interface AlertaDrawback {
  id: string
  numero_ato: string
  cliente: string
  modalidade: string
  data_vencimento: string
  dias_restantes: number
  valor_fob_exportar: number | null
  valor_fob_exportado: number
}

export interface AlertaEntreposto {
  id: string
  numero_lote: string
  beneficiario: string
  regime: string
  descricao_mercadoria: string | null
  data_limite: string
  dias_restantes: number
  recinto_aduaneiro: string | null
}

export async function buscarAlertas(prazo: number = 30): Promise<{
  drawback: AlertaDrawback[]
  entreposto: AlertaEntreposto[]
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { drawback: [], entreposto: [] }

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const limite = new Date(hoje)
  limite.setDate(limite.getDate() + prazo)
  const limiteStr = limite.toISOString().split('T')[0]
  const hojeStr = hoje.toISOString().split('T')[0]

  const [{ data: drawbackData }, { data: entrepostoData }] = await Promise.all([
    supabase
      .from('drawback_atos')
      .select('id, numero_ato, cliente, modalidade, data_vencimento, valor_fob_exportar, valor_fob_exportado')
      .eq('user_id', user.id)
      .in('status', ['vigente', 'prorrogado'])
      .not('data_vencimento', 'is', null)
      .lte('data_vencimento', limiteStr)
      .order('data_vencimento', { ascending: true }),

    supabase
      .from('entreposto_lotes')
      .select('id, numero_lote, beneficiario, regime, descricao_mercadoria, data_limite, recinto_aduaneiro')
      .eq('user_id', user.id)
      .eq('status', 'armazenado')
      .not('data_limite', 'is', null)
      .lte('data_limite', limiteStr)
      .order('data_limite', { ascending: true }),
  ])

  const MODALIDADE_LABELS: Record<string, string> = {
    suspensao: 'Suspensão',
    isencao: 'Isenção',
    restituicao: 'Restituição',
  }
  const REGIME_LABELS: Record<string, string> = {
    comum: 'Comum',
    especial: 'Especial',
    industrial: 'Industrial',
  }

  const drawback: AlertaDrawback[] = (drawbackData ?? []).map((d) => ({
    id: d.id,
    numero_ato: d.numero_ato,
    cliente: d.cliente,
    modalidade: MODALIDADE_LABELS[d.modalidade] ?? d.modalidade,
    data_vencimento: d.data_vencimento!,
    dias_restantes: diffDias(d.data_vencimento!),
    valor_fob_exportar: d.valor_fob_exportar,
    valor_fob_exportado: d.valor_fob_exportado ?? 0,
  }))

  const entreposto: AlertaEntreposto[] = (entrepostoData ?? []).map((e) => ({
    id: e.id,
    numero_lote: e.numero_lote,
    beneficiario: e.beneficiario,
    regime: REGIME_LABELS[e.regime] ?? e.regime,
    descricao_mercadoria: e.descricao_mercadoria,
    data_limite: e.data_limite!,
    dias_restantes: diffDias(e.data_limite!),
    recinto_aduaneiro: e.recinto_aduaneiro,
  }))

  return { drawback, entreposto }
}

// ── Enviar e-mails de alerta ────────────────────────────────────────────────

export async function enviarAlertasAction(_prev: unknown, formData: FormData): Promise<{
  sucesso?: number
  erros?: string[]
  error?: string
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const destinatario = formData.get('email') as string
  if (!destinatario || !destinatario.includes('@')) {
    return { error: 'E-mail destinatário inválido' }
  }

  const idsDrawback = formData.getAll('drawback_ids') as string[]
  const idsEntreposto = formData.getAll('entreposto_ids') as string[]

  if (idsDrawback.length === 0 && idsEntreposto.length === 0) {
    return { error: 'Selecione ao menos um alerta para enviar' }
  }

  const { drawback: todosDrawback, entreposto: todosEntreposto } = await buscarAlertas(365)

  const enviados: Promise<void>[] = []
  const erros: string[] = []

  for (const id of idsDrawback) {
    const alerta = todosDrawback.find((d) => d.id === id)
    if (!alerta) continue
    const { subject, html } = templateAlertaDrawback({
      ...alerta,
      data_vencimento: formatarData(alerta.data_vencimento),
      url_sistema: APP_URL,
    })
    enviados.push(
      resend.emails.send({
        from: 'Comexo <notificacoes@comexo.app>',
        to: destinatario,
        subject,
        html,
      }).then(() => {}).catch((e) => {
        erros.push(`Drawback ${alerta.numero_ato}: ${e.message}`)
      })
    )
  }

  for (const id of idsEntreposto) {
    const alerta = todosEntreposto.find((e) => e.id === id)
    if (!alerta) continue
    const { subject, html } = templateAlertaEntreposto({
      ...alerta,
      data_limite: formatarData(alerta.data_limite),
      url_sistema: APP_URL,
    })
    enviados.push(
      resend.emails.send({
        from: 'Comexo <notificacoes@comexo.app>',
        to: destinatario,
        subject,
        html,
      }).then(() => {}).catch((e) => {
        erros.push(`Entreposto ${alerta.numero_lote}: ${e.message}`)
      })
    )
  }

  await Promise.all(enviados)

  const sucesso = (idsDrawback.length + idsEntreposto.length) - erros.length
  return { sucesso, erros }
}

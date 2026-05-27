export type DrawbackModalidade = 'suspensao' | 'isencao' | 'restituicao'
export type DrawbackStatus = 'vigente' | 'vencido' | 'prorrogado' | 'comprovado' | 'cancelado'

export interface DrawbackAto {
  id: string
  user_id: string
  numero_ato: string
  modalidade: DrawbackModalidade
  cliente: string
  data_concessao: string | null
  data_vencimento: string | null
  prazo_meses: number
  valor_fob_exportar: number | null
  valor_fob_exportado: number
  status: DrawbackStatus
  referencia_interna: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

export interface DrawbackInsumo {
  id: string
  ato_id: string
  user_id: string
  descricao: string
  ncm: string | null
  unidade: string | null
  quantidade_autorizada: number | null
  quantidade_utilizada: number
  valor_unitario_fob: number | null
  ii_suspenso: number
  ipi_suspenso: number
  pis_suspenso: number
  cofins_suspenso: number
  created_at: string
}

export interface DrawbackExportacao {
  id: string
  ato_id: string
  user_id: string
  processo_id: string | null
  numero_due: string | null
  data_embarque: string | null
  valor_fob_exportado: number | null
  mercadoria: string | null
  observacoes: string | null
  created_at: string
}

// ── Labels ────────────────────────────────────────────────────────────────────

export const MODALIDADE_LABELS: Record<DrawbackModalidade, string> = {
  suspensao:    'Suspensão',
  isencao:      'Isenção',
  restituicao:  'Restituição',
}

export const MODALIDADE_COLORS: Record<DrawbackModalidade, string> = {
  suspensao:   'text-cyan-400 bg-cyan-400/10',
  isencao:     'text-violet-400 bg-violet-400/10',
  restituicao: 'text-amber-400 bg-amber-400/10',
}

export const STATUS_DRAWBACK_LABELS: Record<DrawbackStatus, string> = {
  vigente:    'Vigente',
  vencido:    'Vencido',
  prorrogado: 'Prorrogado',
  comprovado: 'Comprovado',
  cancelado:  'Cancelado',
}

export const STATUS_DRAWBACK_COLORS: Record<DrawbackStatus, string> = {
  vigente:    'text-green-400 bg-green-400/10',
  vencido:    'text-red-400 bg-red-400/10',
  prorrogado: 'text-yellow-400 bg-yellow-400/10',
  comprovado: 'text-emerald-400 bg-emerald-400/10',
  cancelado:  'text-slate-500 bg-slate-500/10',
}

// ── Computed helpers ──────────────────────────────────────────────────────────

/** Dias restantes para o vencimento (negativo = vencido) */
export function diasParaVencimento(dataVencimento: string | null): number | null {
  if (!dataVencimento) return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const venc = new Date(dataVencimento)
  venc.setHours(0, 0, 0, 0)
  return Math.round((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

/** Percentual exportado vs comprometido */
export function pctExportado(exportado: number, comprometido: number | null): number {
  if (!comprometido || comprometido === 0) return 0
  return Math.min(100, Math.round((exportado / comprometido) * 100))
}

/** Saldo por insumo */
export function saldoInsumo(insumo: DrawbackInsumo): number {
  return (insumo.quantidade_autorizada ?? 0) - insumo.quantidade_utilizada
}

/** Total de tributos suspensos por insumo */
export function totalTributosSuspensos(insumo: DrawbackInsumo): number {
  return insumo.ii_suspenso + insumo.ipi_suspenso + insumo.pis_suspenso + insumo.cofins_suspenso
}

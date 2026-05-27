export type EntrepostoTipo   = 'importacao' | 'exportacao'
export type EntrepostoRegime = 'comum' | 'especial' | 'industrial'
export type EntrepostoStatus = 'armazenado' | 'desembaracado' | 'reexportado' | 'destruido' | 'abandonado' | 'vencido'
export type EntrepostoTipoSaida = 'desembaraco' | 'reexportacao' | 'destruicao' | 'abandono'

export interface EntrepostoLote {
  id: string
  user_id: string
  numero_lote: string
  processo_id: string | null
  tipo: EntrepostoTipo
  regime: EntrepostoRegime
  beneficiario: string
  descricao_mercadoria: string | null
  ncm: string | null
  quantidade: number | null
  unidade: string | null
  valor_aduaneiro: number | null
  moeda: string
  data_entrada: string
  prazo_meses: number
  data_limite: string | null
  data_saida: string | null
  tipo_saida: EntrepostoTipoSaida | null
  status: EntrepostoStatus
  recinto_aduaneiro: string | null
  numero_dacta: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

// ── Labels ────────────────────────────────────────────────────────────────────

export const REGIME_LABELS: Record<EntrepostoRegime, string> = {
  comum:      'Comum',
  especial:   'Especial',
  industrial: 'Industrial',
}

export const STATUS_ENTREPOSTO_LABELS: Record<EntrepostoStatus, string> = {
  armazenado:    'Armazenado',
  desembaracado: 'Desembaraçado',
  reexportado:   'Reexportado',
  destruido:     'Destruído',
  abandonado:    'Abandonado',
  vencido:       'Vencido',
}

export const STATUS_ENTREPOSTO_COLORS: Record<EntrepostoStatus, string> = {
  armazenado:    'text-cyan-400 bg-cyan-400/10',
  desembaracado: 'text-emerald-400 bg-emerald-400/10',
  reexportado:   'text-violet-400 bg-violet-400/10',
  destruido:     'text-slate-500 bg-slate-500/10',
  abandonado:    'text-slate-500 bg-slate-500/10',
  vencido:       'text-red-400 bg-red-400/10',
}

export const TIPO_SAIDA_LABELS: Record<EntrepostoTipoSaida, string> = {
  desembaraco:  'Despacho para consumo',
  reexportacao: 'Reexportação',
  destruicao:   'Destruição',
  abandono:     'Abandono',
}

// ── Computed helpers ──────────────────────────────────────────────────────────

/** Dias restantes para o limite de permanência (negativo = vencido) */
export function diasParaLimite(dataLimite: string | null): number | null {
  if (!dataLimite) return null
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const limite = new Date(dataLimite)
  limite.setHours(0, 0, 0, 0)
  return Math.round((limite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

/** Calcula data limite a partir da entrada + meses */
export function calcularDataLimite(dataEntrada: string, prazoMeses: number): string {
  const d = new Date(dataEntrada)
  d.setMonth(d.getMonth() + prazoMeses)
  return d.toISOString().slice(0, 10)
}

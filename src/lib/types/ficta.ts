export type FictaTipo =
  | 'zfm'                // Zona Franca de Manaus
  | 'zpe'                // Zona de Processamento de Exportações
  | 'recof'              // RECOF / RECOF-SPED
  | 'drawback_fornecedor'// Venda a beneficiário de Drawback
  | 'outros'

export type FictaStatus =
  | 'aberta'
  | 'em_andamento'
  | 'comprovada'
  | 'cancelada'

export interface OperacaoFicta {
  id: string
  user_id: string
  numero_operacao: string
  tipo: FictaTipo
  status: FictaStatus
  cliente: string
  cnpj_cliente: string | null
  descricao_mercadoria: string | null
  ncm: string | null
  quantidade: number | null
  unidade: string | null
  valor_nf: number | null
  moeda: string
  numero_nf: string | null
  data_nf: string | null
  numero_due: string | null
  data_due: string | null
  beneficio_fiscal: string | null
  valor_beneficio_fiscal: number | null
  comprovante_internamento: string | null
  data_comprovacao: string | null
  processo_id: string | null
  referencia_interna: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

export const FICTA_TIPO_LABELS: Record<FictaTipo, string> = {
  zfm:                 'Zona Franca de Manaus (ZFM)',
  zpe:                 'Zona de Proc. de Exportações (ZPE)',
  recof:               'RECOF / RECOF-SPED',
  drawback_fornecedor: 'Venda a beneficiário Drawback',
  outros:              'Outros',
}

export const FICTA_TIPO_COLORS: Record<FictaTipo, string> = {
  zfm:                 'bg-emerald-500/20 text-emerald-300',
  zpe:                 'bg-blue-500/20 text-blue-300',
  recof:               'bg-purple-500/20 text-purple-300',
  drawback_fornecedor: 'bg-amber-500/20 text-amber-300',
  outros:              'bg-slate-500/20 text-slate-300',
}

export const FICTA_STATUS_LABELS: Record<FictaStatus, string> = {
  aberta:        'Aberta',
  em_andamento:  'Em andamento',
  comprovada:    'Comprovada',
  cancelada:     'Cancelada',
}

export const FICTA_STATUS_COLORS: Record<FictaStatus, string> = {
  aberta:        'bg-blue-500/20 text-blue-300',
  em_andamento:  'bg-amber-500/20 text-amber-300',
  comprovada:    'bg-emerald-500/20 text-emerald-300',
  cancelada:     'bg-red-500/20 text-red-300',
}

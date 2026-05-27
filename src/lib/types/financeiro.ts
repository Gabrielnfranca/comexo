export type LancamentoTipo = 'receita' | 'despesa'
export type LancamentoStatus = 'pendente' | 'pago' | 'cancelado'

export type LancamentoCategoria =
  | 'honorarios'
  | 'imposto_ii'
  | 'imposto_ipi'
  | 'imposto_pis'
  | 'imposto_cofins'
  | 'imposto_icms'
  | 'frete'
  | 'armazenagem'
  | 'seguro'
  | 'cambio'
  | 'outros'

export type Lancamento = {
  id: string
  user_id: string
  processo_id: string | null
  tipo: LancamentoTipo
  categoria: LancamentoCategoria
  descricao: string
  valor: number
  moeda: string
  status: LancamentoStatus
  vencimento: string | null
  pagamento: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
  // join opcional
  processos?: { numero: string; cliente: string } | null
}

export const CATEGORIA_LABELS: Record<LancamentoCategoria, string> = {
  honorarios:      'Honorários',
  imposto_ii:      'II — Imposto de Importação',
  imposto_ipi:     'IPI',
  imposto_pis:     'PIS',
  imposto_cofins:  'COFINS',
  imposto_icms:    'ICMS',
  frete:           'Frete',
  armazenagem:     'Armazenagem',
  seguro:          'Seguro',
  cambio:          'Câmbio',
  outros:          'Outros',
}

export const STATUS_LANCAMENTO_LABELS: Record<LancamentoStatus, string> = {
  pendente:   'Pendente',
  pago:       'Pago',
  cancelado:  'Cancelado',
}

export const STATUS_LANCAMENTO_COLORS: Record<LancamentoStatus, string> = {
  pendente:   'text-amber-400 bg-amber-400/10 border-amber-400/20',
  pago:       'text-green-400 bg-green-400/10 border-green-400/20',
  cancelado:  'text-slate-500 bg-slate-500/10 border-slate-500/20',
}

export const CATEGORIAS_RECEITA: LancamentoCategoria[] = ['honorarios', 'outros']

export const CATEGORIAS_DESPESA: LancamentoCategoria[] = [
  'imposto_ii', 'imposto_ipi', 'imposto_pis', 'imposto_cofins', 'imposto_icms',
  'frete', 'armazenagem', 'seguro', 'cambio', 'honorarios', 'outros',
]

export const MOEDAS = ['BRL', 'USD', 'EUR', 'CNY', 'GBP']

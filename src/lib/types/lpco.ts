export type LpcoStatus =
  | 'rascunho'
  | 'solicitado'
  | 'em_analise'
  | 'aprovado'
  | 'indeferido'
  | 'expirado'
  | 'cancelado'

export type LpcoTipo = 'li' | 'lpco' | 'anuencia'

export type LpcoRegistro = {
  id: string
  user_id: string
  processo_id: string | null
  numero_lpco: string | null
  tipo_licenca: LpcoTipo
  orgao_anuente: string
  ncm_codigo: string | null
  descricao_mercadoria: string | null
  status: LpcoStatus
  data_solicitacao: string | null
  data_aprovacao: string | null
  data_validade: string | null
  quantidade: number | null
  unidade_medida: string | null
  valor_usd: number | null
  importador_cnpj: string | null
  importador_nome: string | null
  exportador_nome: string | null
  pais_origem: string | null
  numero_di: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

export const LPCO_STATUS_LABELS: Record<LpcoStatus, string> = {
  rascunho: 'Rascunho',
  solicitado: 'Solicitado',
  em_analise: 'Em Análise',
  aprovado: 'Aprovado',
  indeferido: 'Indeferido',
  expirado: 'Expirado',
  cancelado: 'Cancelado',
}

export const LPCO_STATUS_COLORS: Record<LpcoStatus, string> = {
  rascunho: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
  solicitado: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  em_analise: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  aprovado: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  indeferido: 'text-red-400 bg-red-400/10 border-red-400/20',
  expirado: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  cancelado: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
}

export const LPCO_TIPO_LABELS: Record<LpcoTipo, string> = {
  li: 'LI — Licença de Importação',
  lpco: 'LPCO — Licença, Permissão, Certificado ou Outros',
  anuencia: 'Anuência Prévia',
}

export const ORGAOS_ANUENTES_LPCO = [
  { value: 'ANVISA', label: 'ANVISA — Vigilância Sanitária' },
  { value: 'MAPA', label: 'MAPA — Ministério Agricultura' },
  { value: 'IBAMA', label: 'IBAMA — Meio Ambiente' },
  { value: 'INMETRO', label: 'INMETRO — Metrologia e Qualidade' },
  { value: 'EXERCITO', label: 'Exército Brasileiro' },
  { value: 'ANATEL', label: 'ANATEL — Telecomunicações' },
  { value: 'CNEN', label: 'CNEN — Nuclear' },
  { value: 'DECEX', label: 'DECEX — Depto. Comércio Exterior' },
  { value: 'ANP', label: 'ANP — Agência Nacional do Petróleo' },
  { value: 'OUTRO', label: 'Outro órgão' },
]

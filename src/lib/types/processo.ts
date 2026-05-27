export type ProcessoTipo = 'importacao' | 'exportacao'

export type ProcessoStatus =
  // Comuns
  | 'aberto'
  | 'aguardando_docs'
  | 'em_transito'
  | 'cancelado'
  // Importação — marítima
  | 'no_porto'
  // Importação — aérea
  | 'no_aeroporto'
  // Importação — desembaraço (marítima e aérea)
  | 'em_desembaraco'
  | 'liberado'
  | 'entregue'
  // Exportação
  | 'registro_due'
  | 'aguardando_embarque'
  | 'embarcado'
  | 'averbado'

export type ProcessoModal = 'maritimo' | 'aereo' | 'rodoviario' | 'ferroviario'
export type ContainerTipo = 'fcl' | 'lcl'

export interface Processo {
  id: string
  numero: string
  tipo: ProcessoTipo
  status: ProcessoStatus
  modal: ProcessoModal | null
  cliente: string
  mercadoria: string | null
  // Importação
  fornecedor: string | null
  numero_di: string | null
  canal_parametrizacao: string | null
  data_registro_di: string | null
  data_desembaraco: string | null
  // Exportação
  numero_due: string | null
  numero_re: string | null
  // Transporte
  armador: string | null
  companhia_aerea: string | null
  numero_bl_awb: string | null
  container_tipo: ContainerTipo | null
  container_numero: string | null
  // Rota
  pais_origem: string | null
  pais_destino: string | null
  porto_embarque: string | null
  porto_destino: string | null
  // Carga
  ncm: string | null
  numero_invoice: string | null
  peso_bruto: number | null
  valor_fob: number | null
  valor_frete: number | null
  valor_seguro: number | null
  moeda: string
  taxa_cambio: number | null
  // Datas
  data_abertura: string
  previsao_chegada: string | null
  // Meta
  responsavel_id: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

export const STATUS_LABELS: Record<ProcessoStatus, string> = {
  aberto: 'Aberto',
  aguardando_docs: 'Aguardando Docs.',
  em_transito: 'Em Trânsito',
  no_porto: 'No Porto/Recinto',
  no_aeroporto: 'No Aeroporto',
  em_desembaraco: 'Em Desembaraço',
  liberado: 'Liberado',
  entregue: 'Entregue',
  registro_due: 'Registro DU-E',
  aguardando_embarque: 'Aguardando Embarque',
  embarcado: 'Embarcado',
  averbado: 'Averbado',
  cancelado: 'Cancelado',
}

export const STATUS_COLORS: Record<ProcessoStatus, string> = {
  aberto: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  aguardando_docs: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  em_transito: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  no_porto: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  no_aeroporto: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  em_desembaraco: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  liberado: 'text-green-400 bg-green-400/10 border-green-400/20',
  entregue: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  registro_due: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  aguardando_embarque: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
  embarcado: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  averbado: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cancelado: 'text-red-400 bg-red-400/10 border-red-400/20',
}

export const TIPO_LABELS: Record<ProcessoTipo, string> = {
  importacao: 'Importação',
  exportacao: 'Exportação',
}

export const TIPO_COLORS: Record<ProcessoTipo, string> = {
  importacao: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  exportacao: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
}

export const MODAL_LABELS: Record<ProcessoModal, string> = {
  maritimo: 'Marítimo',
  aereo: 'Aéreo',
  rodoviario: 'Rodoviário',
  ferroviario: 'Ferroviário',
}

/** Retorna o fluxo de status aplicável para cada combinação tipo+modal */
export function getStatusFlow(tipo: ProcessoTipo, modal: ProcessoModal | null | undefined): ProcessoStatus[] {
  if (tipo === 'importacao') {
    if (modal === 'aereo') {
      return ['aberto', 'aguardando_docs', 'em_transito', 'no_aeroporto', 'em_desembaraco', 'liberado', 'entregue', 'cancelado']
    }
    // marítimo, rodoviário, ferroviário
    return ['aberto', 'aguardando_docs', 'em_transito', 'no_porto', 'em_desembaraco', 'liberado', 'entregue', 'cancelado']
  }
  // exportacao
  return ['aberto', 'aguardando_docs', 'registro_due', 'aguardando_embarque', 'embarcado', 'averbado', 'cancelado']
}

/** Retorna label combinado tipo + modal para exibição nos badges */
export function getTipoModalLabel(tipo: ProcessoTipo, modal: ProcessoModal | null | undefined): string {
  const t = TIPO_LABELS[tipo]
  if (!modal) return t
  if (modal === 'maritimo') return `${t} Marítima`
  if (modal === 'aereo') return `${t} Aérea`
  if (modal === 'rodoviario') return `${t} Rodoviária`
  if (modal === 'ferroviario') return `${t} Ferroviária`
  return t
}

/** Prefixo de numeração por tipo+modal */
export function getNumeroPrefixo(tipo: ProcessoTipo, modal: ProcessoModal | null | undefined): string {
  if (tipo === 'importacao') {
    if (modal === 'aereo') return 'IMP-AER'
    if (modal === 'rodoviario') return 'IMP-ROD'
    return 'IMP-MAR'
  }
  if (modal === 'aereo') return 'EXP-AER'
  if (modal === 'rodoviario') return 'EXP-ROD'
  return 'EXP-MAR'
}

export const STATUS_LIST: ProcessoStatus[] = [
  'aberto', 'aguardando_docs', 'em_transito',
  'no_porto', 'no_aeroporto', 'em_desembaraco',
  'liberado', 'entregue',
  'registro_due', 'aguardando_embarque', 'embarcado', 'averbado',
  'cancelado',
]

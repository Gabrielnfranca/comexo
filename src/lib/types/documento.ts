export type TipoDocumento =
  | 'di'
  | 'de'
  | 'bl'
  | 'awb'
  | 'nf'
  | 'packing_list'
  | 'invoice'
  | 'certificado_origem'
  | 'licenca_importacao'
  | 'outros'

export interface Documento {
  id: string
  user_id: string
  processo_id: string
  tipo_documento: TipoDocumento
  nome_original: string
  storage_path: string
  tamanho: number | null
  mimetype: string | null
  created_at: string
  // join
  processos?: { numero: string; cliente: string }
}

export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  di: 'Declaração de Importação (DI)',
  de: 'Declaração de Exportação (DE)',
  bl: 'Bill of Lading (BL)',
  awb: 'Air Waybill (AWB)',
  nf: 'Nota Fiscal (NF)',
  packing_list: 'Packing List',
  invoice: 'Invoice Comercial',
  certificado_origem: 'Certificado de Origem',
  licenca_importacao: 'Licença de Importação (LI)',
  outros: 'Outros',
}

export const TIPO_DOCUMENTO_ICONES: Record<TipoDocumento, string> = {
  di: '📋',
  de: '📋',
  bl: '🚢',
  awb: '✈️',
  nf: '🧾',
  packing_list: '📦',
  invoice: '💼',
  certificado_origem: '🏅',
  licenca_importacao: '🔑',
  outros: '📄',
}

export const TIPO_DOCUMENTO_LIST: TipoDocumento[] = [
  'invoice',
  'packing_list',
  'bl',
  'awb',
  'di',
  'de',
  'nf',
  'licenca_importacao',
  'certificado_origem',
  'outros',
]

export function formatarTamanho(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

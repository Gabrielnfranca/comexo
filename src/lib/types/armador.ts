export type Armador = {
  id: string
  user_id: string
  nome: string
  codigo: string | null
  modal: string
  pais_sede: string | null
  site: string | null
  observacoes: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export const MODAL_LABELS: Record<string, string> = {
  maritimo: 'Marítimo',
  aereo: 'Aéreo',
  rodoviario: 'Rodoviário',
  ferroviario: 'Ferroviário',
}

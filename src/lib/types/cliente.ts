export type ClienteTipo = 'importador' | 'exportador' | 'ambos'
export type RadarHabilitacao = 'limitada' | 'ilimitada' | 'especial' | 'nenhuma'
export type RegimeTributario = 'simples_nacional' | 'lucro_presumido' | 'lucro_real'

export type Cliente = {
  id: string
  user_id: string
  razao_social: string
  nome_fantasia: string | null
  cnpj: string | null
  tipo: ClienteTipo
  email: string | null
  telefone: string | null
  contato_nome: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  // RADAR
  numero_radar: string | null
  tipo_habilitacao_radar: RadarHabilitacao | null
  validade_radar: string | null
  radar_ativo: boolean
  // Fiscal
  inscricao_estadual: string | null
  regime_tributario: RegimeTributario | null
  observacoes: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export const TIPO_CLIENTE_LABELS: Record<ClienteTipo, string> = {
  importador: 'Importador',
  exportador: 'Exportador',
  ambos: 'Importador/Exportador',
}

export const TIPO_CLIENTE_COLORS: Record<ClienteTipo, string> = {
  importador: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  exportador: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  ambos: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
}

export const TIPO_CLIENTE_LIST: ClienteTipo[] = ['importador', 'exportador', 'ambos']

export const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO',
  'MA','MT','MS','MG','PA','PB','PR','PE','PI',
  'RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

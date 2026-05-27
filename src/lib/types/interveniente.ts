export type IntervenienteTipo =
  | 'agente_carga'
  | 'transportador_terrestre'
  | 'recinto_alfandegado'
  | 'despachante_parceiro'
  | 'agente_exterior'
  | 'fabricante_estrangeiro'
  | 'seguradora'
  | 'banco'

export type Interveniente = {
  id: string
  user_id: string
  tipo: IntervenienteTipo
  razao_social: string
  nome_fantasia: string | null
  cnpj: string | null
  tax_id_exterior: string | null
  pais: string
  email: string | null
  telefone: string | null
  contato_nome: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  codigo_recinto: string | null
  nire: string | null
  ativo: boolean
  observacoes: string | null
  created_at: string
  updated_at: string
}

export const INTERVENIENTE_TIPO_LABELS: Record<IntervenienteTipo, string> = {
  agente_carga: 'Agente de Carga / Freight Forwarder',
  transportador_terrestre: 'Transportador Terrestre',
  recinto_alfandegado: 'Recinto Alfandegado / Terminal',
  despachante_parceiro: 'Despachante Parceiro',
  agente_exterior: 'Agente no Exterior',
  fabricante_estrangeiro: 'Fabricante Estrangeiro',
  seguradora: 'Seguradora',
  banco: 'Banco / Instituição Financeira',
}

export const INTERVENIENTE_TIPO_COLORS: Record<IntervenienteTipo, string> = {
  agente_carga: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  transportador_terrestre: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  recinto_alfandegado: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  despachante_parceiro: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  agente_exterior: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  fabricante_estrangeiro: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  seguradora: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  banco: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
}

export const INTERVENIENTE_TIPOS_LIST: IntervenienteTipo[] = [
  'agente_carga',
  'transportador_terrestre',
  'recinto_alfandegado',
  'despachante_parceiro',
  'agente_exterior',
  'fabricante_estrangeiro',
  'seguradora',
  'banco',
]

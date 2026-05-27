export type CanalParametrizacao = 'verde' | 'amarelo' | 'vermelho' | 'cinza'

export type TributoDiTipo =
  | 'ii'
  | 'ipi'
  | 'pis'
  | 'cofins'
  | 'icms'
  | 'afrmm'
  | 'siscomex'
  | 'outros'

export interface TributoDi {
  id: string
  processo_id: string
  tipo_tributo: TributoDiTipo | string
  descricao: string | null
  base_calculo: number | null
  aliquota: number | null
  valor_calculado: number | null
  valor_pago: number | null
  numero_darf: string | null
  data_pagamento: string | null
  created_at: string
  updated_at: string
}

export const TRIBUTO_LABELS: Record<string, string> = {
  ii:       'II — Imposto de Importação',
  ipi:      'IPI',
  pis:      'PIS-Importação',
  cofins:   'COFINS-Importação',
  icms:     'ICMS',
  afrmm:    'AFRMM',
  siscomex: 'Taxa Siscomex',
  outros:   'Outros',
}

export const CANAL_LABELS: Record<CanalParametrizacao, string> = {
  verde:    'Verde',
  amarelo:  'Amarelo',
  vermelho: 'Vermelho',
  cinza:    'Cinza',
}

export const CANAL_COLORS: Record<CanalParametrizacao, string> = {
  verde:    'text-green-400 bg-green-400/10 border-green-400/30',
  amarelo:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  vermelho: 'text-red-400 bg-red-400/10 border-red-400/30',
  cinza:    'text-slate-400 bg-slate-400/10 border-slate-400/30',
}

export const CANAL_DESCRICAO: Record<CanalParametrizacao, string> = {
  verde:    'Desembaraço automático — sem conferência',
  amarelo:  'Conferência documental',
  vermelho: 'Conferência documental + física',
  cinza:    'Verificação de valor aduaneiro (antidumping)',
}

export const TRIBUTOS_PADRAO: TributoDiTipo[] = ['ii', 'ipi', 'pis', 'cofins', 'icms', 'afrmm', 'siscomex']

export function formatarNumeroDI(numero: string): string {
  // Format: AA/NNNNNNN-D  ex: 26/0123456-7
  const s = numero.replace(/\D/g, '')
  if (s.length === 10) return `${s.slice(0,2)}/${s.slice(2,9)}-${s.slice(9)}`
  return numero
}

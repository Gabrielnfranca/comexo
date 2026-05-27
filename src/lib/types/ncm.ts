export type NcmCodigo = {
  id: string
  user_id: string
  codigo: string
  descricao: string
  aliquota_ii: number | null
  aliquota_ipi: number | null
  aliquota_pis: number | null
  aliquota_cofins: number | null
  unidade_medida: string | null
  // Reforma Tributária 2026
  c_class_trib: string | null
  // Licenciamento
  requer_lpco: boolean
  orgao_anuente: string | null
  tem_antidumping: boolean
  ex_tarifario: string | null
  observacoes: string | null
  created_at: string
  updated_at: string
}

export function formatarNcm(codigo: string): string {
  const s = codigo.replace(/\D/g, '')
  if (s.length === 8) return `${s.slice(0,4)}.${s.slice(4,6)}.${s.slice(6,8)}`
  return s
}

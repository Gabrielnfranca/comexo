export type ProdutoCatalogo = {
  id: string
  user_id: string
  codigo_interno: string | null
  descricao: string
  descricao_comercial: string | null
  ncm_codigo: string
  c_class_trib: string | null
  pais_origem: string | null
  fabricante: string | null
  marca: string | null
  modelo: string | null
  atributos: ProdutoAtributo[]
  requer_lpco: boolean
  orgao_anuente: string | null
  tem_antidumping: boolean
  ex_tarifario: string | null
  unidade_medida: string
  peso_liquido_kg: number | null
  peso_bruto_kg: number | null
  observacoes: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export type ProdutoAtributo = {
  chave: string
  valor: string
}

export const PAISES_COMUNS = [
  { codigo: 'CN', nome: 'China' },
  { codigo: 'US', nome: 'Estados Unidos' },
  { codigo: 'DE', nome: 'Alemanha' },
  { codigo: 'JP', nome: 'Japão' },
  { codigo: 'KR', nome: 'Coreia do Sul' },
  { codigo: 'IT', nome: 'Itália' },
  { codigo: 'FR', nome: 'França' },
  { codigo: 'GB', nome: 'Reino Unido' },
  { codigo: 'BR', nome: 'Brasil' },
  { codigo: 'TW', nome: 'Taiwan' },
  { codigo: 'IN', nome: 'Índia' },
  { codigo: 'MX', nome: 'México' },
  { codigo: 'AR', nome: 'Argentina' },
  { codigo: 'CL', nome: 'Chile' },
  { codigo: 'PT', nome: 'Portugal' },
  { codigo: 'ES', nome: 'Espanha' },
  { codigo: 'NL', nome: 'Holanda' },
  { codigo: 'BE', nome: 'Bélgica' },
  { codigo: 'CA', nome: 'Canadá' },
  { codigo: 'AU', nome: 'Austrália' },
]

export const ORGAOS_ANUENTES = [
  { value: 'ANVISA', label: 'ANVISA — Vigilância Sanitária' },
  { value: 'MAPA', label: 'MAPA — Ministério Agricultura' },
  { value: 'IBAMA', label: 'IBAMA — Meio Ambiente' },
  { value: 'INMETRO', label: 'INMETRO — Metrologia e Qualidade' },
  { value: 'EXERCITO', label: 'Exército Brasileiro' },
  { value: 'ANATEL', label: 'ANATEL — Telecomunicações' },
  { value: 'CNEN', label: 'CNEN — Nuclear' },
  { value: 'DECEX', label: 'DECEX — Depto. Comércio Exterior' },
  { value: 'OUTRO', label: 'Outro órgão' },
]

export function formatarNcm(codigo: string): string {
  const s = codigo.replace(/\D/g, '')
  if (s.length === 8) return `${s.slice(0, 4)}.${s.slice(4, 6)}.${s.slice(6, 8)}`
  return s
}

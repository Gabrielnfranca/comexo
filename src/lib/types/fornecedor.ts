export type Fornecedor = {
  id: string
  user_id: string
  razao_social: string
  nome_fantasia: string | null
  pais: string | null
  cidade: string | null
  contato_nome: string | null
  contato_email: string | null
  contato_telefone: string | null
  site: string | null
  observacoes: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

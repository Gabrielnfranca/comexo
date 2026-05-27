import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Consulta CNPJ via API pública
// GET /api/cnpj/12345678000190
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  // Requer autenticação
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const { cnpj } = await params
  // Limpar formatação: apenas dígitos
  const cnpjLimpo = cnpj.replace(/\D/g, '')

  if (cnpjLimpo.length !== 14) {
    return NextResponse.json({ erro: 'CNPJ inválido' }, { status: 400 })
  }

  try {
    const resp = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 }, // cache 24h
    })

    if (resp.status === 404) {
      return NextResponse.json({ erro: 'CNPJ não encontrado' }, { status: 404 })
    }
    if (resp.status === 429) {
      return NextResponse.json({ erro: 'Limite de consultas atingido. Tente em alguns segundos.' }, { status: 429 })
    }
    if (!resp.ok) {
      return NextResponse.json({ erro: 'Erro ao consultar CNPJ' }, { status: 502 })
    }

    const data = await resp.json()

    // Normalizar resposta
    const end = data.estabelecimento
    const logradouro = [end?.logradouro, end?.numero, end?.complemento].filter(Boolean).join(', ')
    const cidade = end?.cidade?.nome ?? ''
    const estado = end?.estado?.sigla ?? ''
    const cep = end?.cep ?? ''

    return NextResponse.json({
      razao_social: data.razao_social ?? '',
      nome_fantasia: end?.nome_fantasia ?? '',
      cnpj: cnpjLimpo,
      email: end?.email ?? '',
      telefone: end?.ddd1 && end?.telefone1 ? `(${end.ddd1}) ${end.telefone1}` : '',
      endereco: logradouro,
      cidade,
      estado,
      cep: cep.replace(/(\d{5})(\d{3})/, '$1-$2'),
      situacao: end?.situacao_cadastral ?? '',
    })
  } catch {
    return NextResponse.json({ erro: 'Falha na consulta' }, { status: 502 })
  }
}

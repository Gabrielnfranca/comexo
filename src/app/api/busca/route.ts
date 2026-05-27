import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) return NextResponse.json([])

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const termo = `%${q}%`

  const [processos, clientes, drawback, entreposto] = await Promise.all([
    supabase
      .from('processos')
      .select('id, numero_processo, cliente, tipo, status')
      .eq('user_id', user.id)
      .or(`numero_processo.ilike.${termo},cliente.ilike.${termo},referencia_interna.ilike.${termo}`)
      .limit(5),

    supabase
      .from('clientes')
      .select('id, nome, cnpj_cpf, email')
      .eq('user_id', user.id)
      .or(`nome.ilike.${termo},cnpj_cpf.ilike.${termo},email.ilike.${termo}`)
      .limit(5),

    supabase
      .from('drawback_atos')
      .select('id, numero_ato, cliente, modalidade')
      .eq('user_id', user.id)
      .or(`numero_ato.ilike.${termo},cliente.ilike.${termo}`)
      .limit(5),

    supabase
      .from('entreposto_lotes')
      .select('id, numero_lote, beneficiario, regime')
      .eq('user_id', user.id)
      .or(`numero_lote.ilike.${termo},beneficiario.ilike.${termo},numero_dacta.ilike.${termo}`)
      .limit(5),
  ])

  const resultados: unknown[] = []

  for (const p of processos.data ?? []) {
    resultados.push({
      tipo: 'processo',
      id: p.id,
      titulo: p.numero_processo,
      subtitulo: `${p.cliente} · ${p.tipo === 'importacao' ? 'Importação' : 'Exportação'} · ${p.status}`,
      href: `/dashboard/processos/${p.id}`,
    })
  }

  for (const c of clientes.data ?? []) {
    resultados.push({
      tipo: 'cliente',
      id: c.id,
      titulo: c.nome,
      subtitulo: [c.cnpj_cpf, c.email].filter(Boolean).join(' · '),
      href: `/dashboard/clientes/${c.id}`,
    })
  }

  for (const d of drawback.data ?? []) {
    const MODALIDADE: Record<string, string> = { suspensao: 'Suspensão', isencao: 'Isenção', restituicao: 'Restituição' }
    resultados.push({
      tipo: 'drawback',
      id: d.id,
      titulo: d.numero_ato,
      subtitulo: `${d.cliente} · ${MODALIDADE[d.modalidade] ?? d.modalidade}`,
      href: `/dashboard/drawback/${d.id}`,
    })
  }

  for (const e of entreposto.data ?? []) {
    const REGIME: Record<string, string> = { comum: 'Comum', especial: 'Especial', industrial: 'Industrial' }
    resultados.push({
      tipo: 'entreposto',
      id: e.id,
      titulo: e.numero_lote,
      subtitulo: `${e.beneficiario} · ${REGIME[e.regime] ?? e.regime}`,
      href: `/dashboard/entreposto/${e.id}`,
    })
  }

  return NextResponse.json(resultados)
}

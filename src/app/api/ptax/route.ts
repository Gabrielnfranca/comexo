import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Busca PTAX do Banco Central para uma moeda e data
// GET /api/ptax?moeda=USD&data=2026-05-27
export async function GET(request: NextRequest) {
  // Requer autenticação
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const moeda = searchParams.get('moeda') ?? 'USD'
  const dataParam = searchParams.get('data') ?? new Date().toISOString().slice(0, 10)

  // Bacen usa formato MM-DD-YYYY
  const [ano, mes, dia] = dataParam.split('-')
  const dataFmt = `${mes}-${dia}-${ano}`

  // Tentar hoje e recuar até 5 dias úteis caso seja fim de semana/feriado
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const d = new Date(`${dataParam}T12:00:00`)
    d.setDate(d.getDate() - tentativa)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const yyyy = d.getFullYear()
    const dataStr = `${mm}-${dd}-${yyyy}`

    const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='${moeda}'&@dataCotacao='${dataStr}'&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao`

    try {
      const resp = await fetch(url, { next: { revalidate: 3600 } })
      if (!resp.ok) continue

      const json = await resp.json()
      const valores = json?.value
      if (!valores || valores.length === 0) continue

      // Pegar a última cotação do dia
      const ultima = valores[valores.length - 1]
      return NextResponse.json({
        moeda,
        cotacaoCompra: ultima.cotacaoCompra,
        cotacaoVenda: ultima.cotacaoVenda,
        dataHora: ultima.dataHoraCotacao,
        dataCotacao: `${yyyy}-${mm}-${dd}`,
      })
    } catch {
      continue
    }
  }

  return NextResponse.json({ erro: 'PTAX não disponível para esta data/moeda' }, { status: 404 })
}

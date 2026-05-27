import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY não configurada' }, { status: 500 })

  const formData = await request.formData()
  const file = formData.get('arquivo') as File
  if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })

  const maxBytes = 20 * 1024 * 1024
  if (file.size > maxBytes) return NextResponse.json({ error: 'Arquivo maior que 20MB' }, { status: 400 })

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Formato não suportado. Use PDF, JPG, PNG ou WEBP.' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')

  const prompt = `Você é um especialista em comércio exterior brasileiro com amplo conhecimento da NCM (Nomenclatura Comum do Mercosul).

Analise este documento (pode ser uma Invoice, Packing List ou Bill of Lading) e extraia todas as informações disponíveis, retornando SOMENTE um JSON válido com a estrutura abaixo. Se um campo não estiver no documento, use null.

Para o campo ncm_sugerido de cada mercadoria, sugira o código NCM de 8 dígitos mais adequado baseado na descrição, usando o formato "0000.00.00". Justifique brevemente sua escolha no campo ncm_justificativa.

{
  "tipo_documento": "invoice | packing_list | bill_of_lading | outro",
  "numero_documento": null,
  "data_documento": null,
  "exportador_nome": null,
  "exportador_pais": null,
  "importador_nome": null,
  "importador_pais": null,
  "incoterm": null,
  "moeda": null,
  "mercadorias": [
    {
      "descricao": null,
      "quantidade": null,
      "unidade": null,
      "valor_unitario": null,
      "valor_total": null,
      "ncm_sugerido": null,
      "ncm_justificativa": null
    }
  ],
  "valor_total_fob": null,
  "valor_frete": null,
  "valor_seguro": null,
  "peso_bruto_kg": null,
  "numero_volumes": null,
  "observacoes": null
}`

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: file.type, data: base64 } },
          ],
        }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  )

  if (!geminiRes.ok) {
    const err = await geminiRes.text()
    return NextResponse.json({ error: `Erro na API Gemini: ${err}` }, { status: 500 })
  }

  const geminiData = await geminiRes.json()
  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) return NextResponse.json({ error: 'Resposta inválida da IA' }, { status: 500 })

  let extraido: any
  try {
    extraido = JSON.parse(rawText)
  } catch {
    return NextResponse.json({ error: 'A IA não retornou JSON válido' }, { status: 500 })
  }

  const ncmPrincipal = extraido?.mercadorias?.[0]?.ncm_sugerido ?? null

  await supabase.from('ia_consultas').insert({
    user_id: user.id,
    nome_arquivo: file.name,
    tipo_documento: extraido.tipo_documento ?? 'outro',
    dados_extraidos: extraido,
    ncm_principal: ncmPrincipal,
  })

  return NextResponse.json(extraido)
}

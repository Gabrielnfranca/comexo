// ── Templates de E-mail HTML ─────────────────────────────────────────────────

export function templateAlertaDrawback(dados: {
  numero_ato: string
  cliente: string
  modalidade: string
  data_vencimento: string
  dias_restantes: number
  valor_fob_exportar: number | null
  valor_fob_exportado: number
  url_sistema: string
}): { subject: string; html: string } {
  const urgente = dados.dias_restantes <= 7
  const cor = urgente ? '#DC2626' : '#D97706'
  const pct = dados.valor_fob_exportar
    ? Math.round((dados.valor_fob_exportado / dados.valor_fob_exportar) * 100)
    : 0

  const subject = urgente
    ? `⚠️ URGENTE: Drawback ${dados.numero_ato} vence em ${dados.dias_restantes} dias`
    : `Alerta: Drawback ${dados.numero_ato} vence em ${dados.dias_restantes} dias`

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:#1E3A5F;padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Comexo</h1>
          <p style="margin:4px 0 0;color:#93C5FD;font-size:13px;">Sistema de Comércio Exterior</p>
        </td></tr>

        <!-- Alerta banner -->
        <tr><td style="background:${cor};padding:16px 32px;">
          <p style="margin:0;color:#ffffff;font-size:15px;font-weight:600;">
            ${urgente ? '⚠️ Alerta Urgente — Vencimento Iminente' : '⏰ Alerta de Vencimento — Drawback'}
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
            O ato concessório de Drawback abaixo <strong>vence em ${dados.dias_restantes} dias</strong>.
            Por favor, tome as providências necessárias.
          </p>

          <!-- Tabela de dados -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;overflow:hidden;margin-bottom:24px;">
            <tr style="background:#F3F4F6;">
              <td colspan="2" style="padding:12px 16px;font-size:13px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;">
                Informações do Ato Concessório
              </td>
            </tr>
            <tr style="border-top:1px solid #E5E7EB;">
              <td style="padding:10px 16px;font-size:14px;color:#6B7280;width:40%;">Nº Ato Concessório</td>
              <td style="padding:10px 16px;font-size:14px;color:#111827;font-weight:600;">${dados.numero_ato}</td>
            </tr>
            <tr style="border-top:1px solid #E5E7EB;background:#F9FAFB;">
              <td style="padding:10px 16px;font-size:14px;color:#6B7280;">Cliente / Beneficiário</td>
              <td style="padding:10px 16px;font-size:14px;color:#111827;">${dados.cliente}</td>
            </tr>
            <tr style="border-top:1px solid #E5E7EB;">
              <td style="padding:10px 16px;font-size:14px;color:#6B7280;">Modalidade</td>
              <td style="padding:10px 16px;font-size:14px;color:#111827;">${dados.modalidade}</td>
            </tr>
            <tr style="border-top:1px solid #E5E7EB;background:#F9FAFB;">
              <td style="padding:10px 16px;font-size:14px;color:#6B7280;">Data de Vencimento</td>
              <td style="padding:10px 16px;font-size:14px;color:${cor};font-weight:700;">${dados.data_vencimento}</td>
            </tr>
            <tr style="border-top:1px solid #E5E7EB;">
              <td style="padding:10px 16px;font-size:14px;color:#6B7280;">Comprometimento FOB</td>
              <td style="padding:10px 16px;font-size:14px;color:#111827;">${pct}% exportado</td>
            </tr>
          </table>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${dados.url_sistema}/dashboard/drawback"
               style="display:inline-block;background:#1E3A5F;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">
              Ver no Sistema →
            </a>
          </div>

          <p style="margin:0;color:#9CA3AF;font-size:12px;line-height:1.5;">
            Esta mensagem foi enviada pelo sistema Comexo. Não responda este e-mail.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#F9FAFB;border-top:1px solid #E5E7EB;padding:16px 32px;">
          <p style="margin:0;color:#9CA3AF;font-size:12px;text-align:center;">
            © ${new Date().getFullYear()} Comexo · Sistema de Comércio Exterior
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject, html }
}

// ─────────────────────────────────────────────────────────────────────────────

export function templateAlertaEntreposto(dados: {
  numero_lote: string
  beneficiario: string
  regime: string
  descricao_mercadoria: string | null
  data_limite: string
  dias_restantes: number
  recinto_aduaneiro: string | null
  url_sistema: string
}): { subject: string; html: string } {
  const urgente = dados.dias_restantes <= 7
  const cor = urgente ? '#DC2626' : '#D97706'

  const subject = urgente
    ? `⚠️ URGENTE: Entreposto ${dados.numero_lote} vence em ${dados.dias_restantes} dias`
    : `Alerta: Entreposto ${dados.numero_lote} vence em ${dados.dias_restantes} dias`

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:#1E3A5F;padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Comexo</h1>
          <p style="margin:4px 0 0;color:#93C5FD;font-size:13px;">Sistema de Comércio Exterior</p>
        </td></tr>

        <!-- Alerta banner -->
        <tr><td style="background:${cor};padding:16px 32px;">
          <p style="margin:0;color:#ffffff;font-size:15px;font-weight:600;">
            ${urgente ? '⚠️ Alerta Urgente — Prazo de Permanência Iminente' : '⏰ Alerta de Prazo — Entreposto Aduaneiro'}
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
            O lote de Entreposto Aduaneiro abaixo <strong>atinge o prazo limite em ${dados.dias_restantes} dias</strong>.
            É necessário providenciar o despacho, reexportação ou outra destinação aduaneira.
          </p>

          <!-- Tabela de dados -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;overflow:hidden;margin-bottom:24px;">
            <tr style="background:#F3F4F6;">
              <td colspan="2" style="padding:12px 16px;font-size:13px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;">
                Informações do Lote
              </td>
            </tr>
            <tr style="border-top:1px solid #E5E7EB;">
              <td style="padding:10px 16px;font-size:14px;color:#6B7280;width:40%;">Nº Lote / DACTA</td>
              <td style="padding:10px 16px;font-size:14px;color:#111827;font-weight:600;">${dados.numero_lote}</td>
            </tr>
            <tr style="border-top:1px solid #E5E7EB;background:#F9FAFB;">
              <td style="padding:10px 16px;font-size:14px;color:#6B7280;">Beneficiário</td>
              <td style="padding:10px 16px;font-size:14px;color:#111827;">${dados.beneficiario}</td>
            </tr>
            <tr style="border-top:1px solid #E5E7EB;">
              <td style="padding:10px 16px;font-size:14px;color:#6B7280;">Regime</td>
              <td style="padding:10px 16px;font-size:14px;color:#111827;">${dados.regime}</td>
            </tr>
            ${dados.descricao_mercadoria ? `
            <tr style="border-top:1px solid #E5E7EB;background:#F9FAFB;">
              <td style="padding:10px 16px;font-size:14px;color:#6B7280;">Mercadoria</td>
              <td style="padding:10px 16px;font-size:14px;color:#111827;">${dados.descricao_mercadoria}</td>
            </tr>` : ''}
            ${dados.recinto_aduaneiro ? `
            <tr style="border-top:1px solid #E5E7EB;">
              <td style="padding:10px 16px;font-size:14px;color:#6B7280;">Recinto Aduaneiro</td>
              <td style="padding:10px 16px;font-size:14px;color:#111827;">${dados.recinto_aduaneiro}</td>
            </tr>` : ''}
            <tr style="border-top:1px solid #E5E7EB;background:#F9FAFB;">
              <td style="padding:10px 16px;font-size:14px;color:#6B7280;">Data Limite</td>
              <td style="padding:10px 16px;font-size:14px;color:${cor};font-weight:700;">${dados.data_limite}</td>
            </tr>
          </table>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${dados.url_sistema}/dashboard/entreposto"
               style="display:inline-block;background:#1E3A5F;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">
              Ver no Sistema →
            </a>
          </div>

          <p style="margin:0;color:#9CA3AF;font-size:12px;line-height:1.5;">
            Esta mensagem foi enviada pelo sistema Comexo. Não responda este e-mail.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#F9FAFB;border-top:1px solid #E5E7EB;padding:16px 32px;">
          <p style="margin:0;color:#9CA3AF;font-size:12px;text-align:center;">
            © ${new Date().getFullYear()} Comexo · Sistema de Comércio Exterior
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject, html }
}

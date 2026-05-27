import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
    }

    const supabase = await createServiceClient()

    const { data, error: supabaseError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha`,
      },
    })

    if (supabaseError || !data?.properties?.action_link) {
      console.error('[reset-password] generateLink error:', supabaseError?.message)
      return NextResponse.json({ ok: true })
    }

    const link = data.properties.action_link

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodemailer = require('nodemailer')

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0A101D;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A101D;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:16px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">
        <tr><td style="height:3px;background:linear-gradient(90deg,transparent,#F59E0B,transparent);"></td></tr>
        <tr>
          <td align="center" style="padding:36px 40px 24px;">
            <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#F59E0B;">COMEXO</p>
            <p style="margin:0;font-size:13px;color:#64748B;">Plataforma de Comercio Exterior</p>
          </td>
        </tr>
        <tr><td style="height:1px;background:rgba(255,255,255,0.05);"></td></tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#F1F5F9;">Redefinicao de senha</p>
            <p style="margin:0 0 24px;font-size:14px;color:#94A3B8;line-height:1.6;">
              Recebemos uma solicitacao para redefinir a senha da sua conta.
              Clique no botao abaixo para criar uma nova senha.
            </p>
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr><td align="center" style="padding:4px 0 28px;">
                <a href="LINK_PLACEHOLDER" style="display:inline-block;background:linear-gradient(135deg,#F59E0B,#D97706);color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:12px;">
                  Redefinir minha senha
                </a>
              </td></tr>
            </table>
            <p style="margin:0 0 24px;font-size:11px;color:#475569;word-break:break-all;background:#0A101D;padding:12px;border-radius:8px;border:1px solid rgba(255,255,255,0.05);">LINK_PLACEHOLDER</p>
            <p style="margin:0;font-size:12px;color:#475569;line-height:1.5;">
              Este link expira em <strong style="color:#94A3B8;">1 hora</strong>.<br/>
              Se nao solicitou, ignore este e-mail.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 28px;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="margin:0;font-size:11px;color:#334155;text-align:center;">Comexo - Plataforma B2B de Comercio Exterior</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const htmlWithLink = html.split('LINK_PLACEHOLDER').join(link)

    await transporter.sendMail({
      from: `"Comexo" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Redefinicao de senha - Comexo',
      html: htmlWithLink,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[api/auth/reset-password]', err)
    return NextResponse.json({ ok: true })
  }
}

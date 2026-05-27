import { createClient } from '@/lib/supabase/server'
import type { AuditAcao } from '@/lib/types/usuario'

/**
 * Registra uma ação no audit_log.
 * Chame em Server Actions após operações sensíveis.
 */
export async function registrarAudit(params: {
  acao: AuditAcao
  modulo?: string
  registro_id?: string
  descricao?: string
  dados_novos?: Record<string, unknown>
}): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('audit_log').insert({
      user_id:     user?.id ?? null,
      user_email:  user?.email ?? null,
      acao:        params.acao,
      modulo:      params.modulo ?? null,
      registro_id: params.registro_id ?? null,
      descricao:   params.descricao ?? null,
      dados_novos: params.dados_novos ?? null,
    })
  } catch {
    // Falha silenciosa — não deve bloquear a operação principal
    console.error('[audit] Falha ao registrar ação:', params.acao)
  }
}

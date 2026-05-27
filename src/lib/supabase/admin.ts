import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase com service_role.
 * NUNCA expor no frontend — somente em Server Actions e scripts server-side.
 */
export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

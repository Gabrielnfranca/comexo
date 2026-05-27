import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_SERVER_ENV_MISSING')
  }

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorado em Server Components — cookies só podem ser setados em Server Actions/Route Handlers
          }
        },
      },
    }
  )
}

/** Cliente com service_role — NUNCA usar no frontend */
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRole) {
    throw new Error('SUPABASE_SERVICE_ENV_MISSING')
  }

  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    supabaseUrl,
    serviceRole,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

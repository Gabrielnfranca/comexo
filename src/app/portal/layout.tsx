import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PortalHeader from './PortalHeader'

export const dynamic = 'force-dynamic'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  // Para rotas protegidas, busca dados do usuário para o header
  // O redirecionamento de não-autenticados é feito no middleware
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-[#0A101D]">
      {user && <PortalHeader userEmail={user.email ?? ''} />}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

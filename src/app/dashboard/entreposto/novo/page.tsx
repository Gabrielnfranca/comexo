import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import NovoEntrepostoForm from './NovoEntrepostoForm'

export default async function NovoEntrepostoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/entreposto" className="text-slate-500 dark:text-slate-400 hover:text-white transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Novo Lote — Entreposto Aduaneiro</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Cadastre um lote para controle de permanência</p>
        </div>
      </div>
      <NovoEntrepostoForm />
    </div>
  )
}

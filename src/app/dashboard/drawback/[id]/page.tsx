import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import NovoDrawbackForm from '../novo/NovoDrawbackForm'

export default async function NovoDrawbackPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/drawback"
          className="text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Novo Ato Concessório</h1>
          <p className="text-slate-500 dark:text-slate-500 dark:text-slate-500 dark:text-slate-400 text-sm mt-0.5">Cadastre um ato de Drawback</p>
        </div>
      </div>

      <NovoDrawbackForm />
    </div>
  )
}

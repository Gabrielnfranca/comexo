import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FictaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('operacoes_fictas')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!data) notFound()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/ficta"
          className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-white text-sm transition"
        >
          <ArrowLeft size={16} />
          Voltar para Operações Fictas
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Detalhe da Operação</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 dark:text-slate-400">Nº Operação</p>
            <p className="text-slate-900 dark:text-white">{data.numero_operacao ?? '-'}</p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400">Cliente</p>
            <p className="text-slate-900 dark:text-white">{data.cliente ?? '-'}</p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400">Tipo</p>
            <p className="text-slate-900 dark:text-white">{data.tipo ?? '-'}</p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400">Status</p>
            <p className="text-slate-900 dark:text-white">{data.status ?? '-'}</p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400">NCM</p>
            <p className="text-slate-900 dark:text-white">{data.ncm ?? '-'}</p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400">Moeda</p>
            <p className="text-slate-900 dark:text-white">{data.moeda ?? '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

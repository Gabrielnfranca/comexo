import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import FictaDetail from './FictaDetail'
import { OperacaoFicta } from '@/lib/types/ficta'

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

  return <FictaDetail op={data as OperacaoFicta} />
}

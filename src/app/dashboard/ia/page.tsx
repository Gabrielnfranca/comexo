import { createClient } from '@/lib/supabase/server'
import { Sparkles } from 'lucide-react'
import IAClient from './IAClient'

export default async function IAPage() {
  const supabase = await createClient()
  const { data: historico } = await supabase
    .from('ia_consultas')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/15 flex items-center justify-center">
          <Sparkles size={24} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">IA Comex</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Análise automática de Invoice, Packing List e BL com sugestão de NCM — powered by Gemini
          </p>
        </div>
      </div>

      <IAClient historico={historico ?? []} />
    </div>
  )
}

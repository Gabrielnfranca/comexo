import { Bell } from 'lucide-react'
import { buscarAlertas } from './actions'
import NotificacoesClient from './NotificacoesClient'

export const dynamic = 'force-dynamic'

export default async function NotificacoesPage() {
  const { drawback, entreposto } = await buscarAlertas(30)

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Bell className="h-7 w-7 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Notificações</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Alertas de vencimento de Drawback e Entreposto Aduaneiro nos próximos 30 dias.
            Selecione os alertas e envie e-mails de notificação.
          </p>
        </div>
      </div>

      <NotificacoesClient alertasDrawback={drawback} alertasEntreposto={entreposto} />
    </div>
  )
}

import { requirePerfil, listarUsuariosComEmail } from '@/lib/auth/perfil'
import { PERFIL_LABELS, PERFIL_COLORS } from '@/lib/types/usuario'
import type { PerfilTipo } from '@/lib/types/usuario'
import { ConvidarUsuarioModal } from './ConvidarModal'
import { UsuarioMenu } from './UsuarioMenu'
import { Users2 } from 'lucide-react'

export default async function UsuariosPage() {
  await requirePerfil('gerenciar_usuarios')
  const usuarios = await listarUsuariosComEmail()

  const ativos   = usuarios.filter(u => u.ativo)
  const inativos = usuarios.filter(u => !u.ativo)

  function Avatarzinho({ nome, email }: { nome: string; email?: string }) {
    const inicial = (nome || email || '?')[0].toUpperCase()
    return (
      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-white/70 shrink-0">
        {inicial}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
            <Users2 className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Usuários</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {ativos.length} membro{ativos.length !== 1 ? 's' : ''} ativo{ativos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <ConvidarUsuarioModal />
      </div>

      {/* Lista ativa */}
      <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Membros ativos</h2>
        </div>

        {ativos.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">
            Nenhum usuário ativo.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {ativos.map(u => (
              <li key={u.id} className="flex items-center gap-4 px-5 py-3">
                <Avatarzinho nome={u.nome} email={u.email} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {u.nome || u.email || '—'}
                  </p>
                  {u.email && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                  )}
                </div>
                <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${PERFIL_COLORS[u.perfil as PerfilTipo]}`}>
                  {PERFIL_LABELS[u.perfil as PerfilTipo]}
                </span>
                <UsuarioMenu usuario={u} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Lista inativa */}
      {inativos.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Membros inativos</h2>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {inativos.map(u => (
              <li key={u.id} className="flex items-center gap-4 px-5 py-3 opacity-60">
                <Avatarzinho nome={u.nome} email={u.email} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate line-through">
                    {u.nome || u.email || '—'}
                  </p>
                  {u.email && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                  )}
                </div>
                <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-white/10 text-slate-500 bg-slate-100 dark:bg-white/5">
                  {PERFIL_LABELS[u.perfil as PerfilTipo]} · inativo
                </span>
                <UsuarioMenu usuario={u} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Info perfis */}
      <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Níveis de acesso</h2>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {(Object.entries(PERFIL_LABELS) as [PerfilTipo, string][]).map(([key, label]) => (
            <div key={key} className="flex items-center gap-3 px-5 py-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${PERFIL_COLORS[key]} w-36 justify-center`}>
                {label}
              </span>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex-1">
                {PERFIL_DESCRICAO_MAP[key]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const PERFIL_DESCRICAO_MAP: Record<PerfilTipo, string> = {
  admin:      'Acesso total — configura usuários, vê todos os dados, aprova sem limite',
  supervisor: 'Aprova pagamentos, libera processos, vê relatórios financeiros completos',
  analista:   'Registra processos e despacho — sem acesso financeiro de outros processos',
  financeiro: 'Contas a pagar/receber, confirma pagamentos, gera relatórios',
}

'use client'

import { useActionState, useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { convidarUsuarioAction } from './actions'
import { PERFIL_LABELS } from '@/lib/types/usuario'
import type { PerfilTipo } from '@/lib/types/usuario'

const PERFIS: PerfilTipo[] = ['admin', 'supervisor', 'analista', 'financeiro']

export function ConvidarUsuarioModal() {
  const [aberto, setAberto] = useState(false)
  const [state, formAction, pending] = useActionState(convidarUsuarioAction, null)

  // Fecha automaticamente ao sucesso
  if (state?.ok && aberto) setAberto(false)

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        Convidar membro
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-6">
            <button
              onClick={() => setAberto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              Convidar membro
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Um e-mail de acesso será enviado para o endereço informado.
            </p>

            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome
                </label>
                <input
                  name="nome"
                  type="text"
                  placeholder="Nome completo"
                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="usuario@empresa.com"
                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Perfil de acesso <span className="text-red-500">*</span>
                </label>
                <select
                  name="perfil"
                  defaultValue="analista"
                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {PERFIS.map(p => (
                    <option key={p} value={p}>{PERFIL_LABELS[p]}</option>
                  ))}
                </select>
              </div>

              {state?.erro && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">
                  {state.erro}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {pending ? 'Enviando...' : 'Enviar convite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

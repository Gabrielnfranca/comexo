'use client'

import { useState, useTransition } from 'react'
import { MoreVertical, Edit2, UserX, UserCheck } from 'lucide-react'
import { alterarPerfilAction, desativarUsuarioAction, reativarUsuarioAction } from './actions'
import { PERFIL_LABELS } from '@/lib/types/usuario'
import type { PerfilTipo, PerfilUsuario } from '@/lib/types/usuario'

const PERFIS: PerfilTipo[] = ['admin', 'supervisor', 'analista', 'financeiro']

export function UsuarioMenu({ usuario }: { usuario: PerfilUsuario }) {
  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState(false)
  const [perfil, setPerfil] = useState<PerfilTipo>(usuario.perfil as PerfilTipo)
  const [isPending, startTransition] = useTransition()

  function salvarPerfil() {
    startTransition(async () => {
      await alterarPerfilAction(usuario.user_id, perfil)
      setEditando(false)
      setAberto(false)
    })
  }

  function toggleAtivo() {
    startTransition(async () => {
      if (usuario.ativo) {
        await desativarUsuarioAction(usuario.user_id)
      } else {
        await reativarUsuarioAction(usuario.user_id)
      }
      setAberto(false)
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setAberto(false); setEditando(false) }} />
          <div className="absolute right-0 top-8 z-20 w-52 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-lg py-1">
            {!editando ? (
              <>
                <button
                  onClick={() => setEditando(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 text-left"
                >
                  <Edit2 className="w-4 h-4" />
                  Alterar perfil
                </button>
                <button
                  onClick={toggleAtivo}
                  disabled={isPending}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/5 text-left disabled:opacity-50 text-red-500 dark:text-red-400"
                >
                  {usuario.ativo
                    ? <><UserX className="w-4 h-4" /> Desativar</>
                    : <><UserCheck className="w-4 h-4 text-green-500" /><span className="text-green-600 dark:text-green-400">Reativar</span></>
                  }
                </button>
              </>
            ) : (
              <div className="px-3 py-2 space-y-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Novo perfil:</p>
                <select
                  value={perfil}
                  onChange={e => setPerfil(e.target.value as PerfilTipo)}
                  className="w-full rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-700 px-2 py-1.5 text-sm text-slate-900 dark:text-white"
                >
                  {PERFIS.map(p => (
                    <option key={p} value={p}>{PERFIL_LABELS[p]}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditando(false)}
                    className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={salvarPerfil}
                    disabled={isPending}
                    className="flex-1 px-2 py-1 text-xs rounded bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-60"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

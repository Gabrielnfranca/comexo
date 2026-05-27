'use client'

import { useState } from 'react'
import { Menu, X, LogOut } from 'lucide-react'
import { Suspense } from 'react'
import SidebarNav from '@/components/SidebarNav'
import { logoutAction } from '@/app/(auth)/login/actions'

interface Props {
  userEmail: string
}

export default function MobileNav({ userEmail }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Botão hamburger — só aparece em telas pequenas */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
      >
        <Menu size={22} />
      </button>

      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Painel lateral */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#0F2643] flex flex-col shadow-2xl">

            {/* Logo + fechar */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <span className="text-white font-bold text-sm">CX</span>
                </div>
                <div>
                  <p className="text-white font-bold text-base leading-none">COMEXO</p>
                  <p className="text-slate-500 text-xs mt-0.5">Comércio Exterior</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navegação — fechar ao clicar em um link */}
            <div
              className="flex-1 overflow-y-auto"
              onClick={() => setOpen(false)}
            >
              <Suspense fallback={<div className="flex-1" />}>
                <SidebarNav />
              </Suspense>
            </div>

            {/* Usuário + logout */}
            <div className="px-3 py-4 border-t border-white/5 shrink-0">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-1">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <span className="text-amber-400 text-xs font-bold">
                    {userEmail[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{userEmail}</p>
                  <p className="text-slate-500 text-xs">Admin</p>
                </div>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400
                             hover:bg-red-500/10 hover:text-red-400 transition"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logoutAction } from '@/app/(auth)/login/actions'
import { LogOut, Bell, Globe } from 'lucide-react'
import SidebarNav from '@/components/SidebarNav'
import MobileNav from '@/components/MobileNav'
import BuscaGlobal from '@/components/BuscaGlobal'
import ThemeToggle from '@/components/ThemeToggle'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden">

      {/* Sidebar — oculto em mobile */}
      <aside className="hidden md:flex w-64 shrink-0 bg-white dark:bg-[#0F2643] border-r border-slate-200 dark:border-white/5 flex-col">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/20 shrink-0">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-slate-900 dark:text-white font-bold text-base leading-none tracking-tight">COMEXO</p>
              <p className="text-slate-500 dark:text-blue-200/50 text-xs mt-1 leading-none">Simplificando o Comex</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <Suspense fallback={<div className="flex-1" />}>
          <SidebarNav />
        </Suspense>

        {/* Usuário logado */}
        <div className="px-3 py-4 border-t border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 mb-1">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <span className="text-amber-500 dark:text-amber-400 text-xs font-bold">
                {user.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 dark:text-white text-xs font-medium truncate">{user.email}</p>
              <p className="text-slate-500 dark:text-blue-200/50 text-xs">Admin</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-blue-200/70
                         hover:bg-red-500/10 hover:text-red-400 transition"
            >
              <LogOut size={16} />
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Hamburger mobile */}
            <MobileNav userEmail={user.email!} />
            <div>
              <p className="text-slate-800 dark:text-white font-semibold">Dashboard</p>
              <p className="text-slate-500 text-xs">Visão geral dos processos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BuscaGlobal />
            <ThemeToggle />
            <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Página */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

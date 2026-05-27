'use client'

import { useState, useTransition } from 'react'
import { LogOut, ChevronDown } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export default function PortalHeader({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleLogout() {
    startTransition(async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
      await supabase.auth.signOut()
      router.push('/portal/login')
    })
  }

  return (
    <header className="border-b border-white/5 bg-slate-900/60 backdrop-blur">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo / marca */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <span className="text-amber-400 text-xs font-bold">C</span>
          </div>
          <span className="text-white font-semibold text-sm">Comexo</span>
          <span className="text-slate-600 text-sm">· Portal do Cliente</span>
        </div>

        {/* Menu do usuário */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition text-sm"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <span className="text-amber-400 text-xs font-bold uppercase">
                {userEmail[0]}
              </span>
            </div>
            <span className="hidden sm:block max-w-[160px] truncate">{userEmail}</span>
            <ChevronDown size={14} className="text-slate-500" />
          </button>

          {open && (
            <div className="absolute right-0 mt-1 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition"
              >
                <LogOut size={15} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

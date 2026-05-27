'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Antes do mount, assume dark (padrão) para evitar hydration mismatch
  const isDark = !mounted || theme === 'dark'

  return (
    <button
      onClick={() => mounted && setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className="p-2 rounded-lg text-slate-400 hover:text-amber-400
                 hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
      suppressHydrationWarning
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}

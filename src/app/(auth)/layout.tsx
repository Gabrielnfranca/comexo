export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0A101D] flex relative items-center justify-center p-4 overflow-hidden">
      {/* Glow effects */}
      <div className="absolute top-0 -left-1/4 w-[150%] h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1E3A5F]/10 dark:from-[#1E3A5F]/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute bottom-[-20%] -right-1/4 w-[100%] h-[500px] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none dark:block"></div>
      
      <div className="w-full max-w-md relative z-10">
        {children}
      </div>
    </div>
  )
}

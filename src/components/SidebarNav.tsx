'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  Users,
  Settings,
  ChevronRight,
  ChevronDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  BookOpen,
  Building2,
  Ship,
  Tag,
  BarChart2,
  PackageSearch,
  Warehouse,
  Bell,
  FileOutput,
  FileCheck2,
  Anchor,
  Globe,
  Sparkles,
  ShieldCheck,
  Calculator,
  Package,
  Users2,
  Plane,
} from 'lucide-react'

const CADASTROS_ITEMS = [
  { icon: Building2, label: 'Fornecedores',   href: '/dashboard/cadastros/fornecedores' },
  { icon: Ship,      label: 'Armadores',      href: '/dashboard/cadastros/armadores' },
  { icon: Tag,       label: 'NCM',            href: '/dashboard/cadastros/ncm' },
  { icon: Package,   label: 'Produtos',       href: '/dashboard/cadastros/produtos' },
  { icon: Users2,    label: 'Intervenientes', href: '/dashboard/cadastros/intervenientes' },
]

function NavLink({ href, icon: Icon, label, ativo }: { href: string; icon: any; label: string; ativo: boolean }) {
  return (
    <Link href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
        ${ativo ? 'bg-amber-500/15 text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
    >
      <Icon size={18} className="shrink-0" />
      <span className="flex-1">{label}</span>
      {ativo && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
    </Link>
  )
}

function SubLink({ href, icon: Icon, label, ativo }: { href: string; icon: any; label: string; ativo: boolean }) {
  return (
    <Link href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition
        ${ativo ? 'bg-amber-500/10 text-amber-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
    >
      <Icon size={14} className="shrink-0" />
      <span className="flex-1">{label}</span>
      {ativo && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />}
    </Link>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 pt-5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 select-none">
      {label}
    </p>
  )
}

export default function SidebarNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tipoAtual = searchParams.get('tipo')
  const modalAtual = searchParams.get('modal')

  const emProcessos  = pathname.startsWith('/dashboard/processos')
  const importAtiva  = emProcessos && tipoAtual === 'importacao'
  const exportAtiva  = emProcessos && tipoAtual === 'exportacao'
  const cadastrosAtivo = pathname.startsWith('/dashboard/cadastros')

  const [importAberta,   setImportAberta]   = useState(importAtiva)
  const [exportAberta,   setExportAberta]   = useState(exportAtiva)
  const [cadastrosAberto, setCadastrosAberto] = useState(cadastrosAtivo)

  return (
    <nav className="flex-1 px-3 py-4 overflow-y-auto sidebar-scroll flex flex-col gap-0">

      {/* ── PRINCIPAL ───────────────────────────────── */}
      <div className="space-y-0.5">

        <NavLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" ativo={pathname === '/dashboard'} />

        {/* Importação */}
        <div>
          <button type="button" onClick={() => setImportAberta(v => !v)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
              ${importAtiva ? 'bg-amber-500/15 text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
            <ArrowDownToLine size={18} className="shrink-0" />
            <span className="flex-1 text-left">Importação</span>
            {importAberta ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}
          </button>
          {importAberta && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 dark:border-white/5 pl-3">
              <SubLink href="/dashboard/processos?tipo=importacao&modal=maritimo" icon={Ship}  label="Marítima" ativo={importAtiva && modalAtual === 'maritimo'} />
              <SubLink href="/dashboard/processos?tipo=importacao&modal=aereo"    icon={Plane} label="Aérea"    ativo={importAtiva && modalAtual === 'aereo'} />
            </div>
          )}
        </div>

        {/* Exportação */}
        <div>
          <button type="button" onClick={() => setExportAberta(v => !v)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
              ${exportAtiva ? 'bg-amber-500/15 text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
            <ArrowUpFromLine size={18} className="shrink-0" />
            <span className="flex-1 text-left">Exportação</span>
            {exportAberta ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}
          </button>
          {exportAberta && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 dark:border-white/5 pl-3">
              <SubLink href="/dashboard/processos?tipo=exportacao&modal=maritimo" icon={Ship}  label="Marítima" ativo={exportAtiva && modalAtual === 'maritimo'} />
              <SubLink href="/dashboard/processos?tipo=exportacao&modal=aereo"    icon={Plane} label="Aérea"    ativo={exportAtiva && modalAtual === 'aereo'} />
            </div>
          )}
        </div>

        <NavLink href="/dashboard/financeiro" icon={DollarSign} label="Financeiro" ativo={pathname.startsWith('/dashboard/financeiro')} />
        <NavLink href="/dashboard/clientes"   icon={Users}      label="Clientes"   ativo={pathname.startsWith('/dashboard/clientes')} />
        <NavLink href="/dashboard/documentos" icon={FileText}   label="Documentos" ativo={pathname.startsWith('/dashboard/documentos')} />
      </div>

      {/* ── OPERAÇÕES ADUANEIRAS ────────────────────── */}
      <div className="space-y-0.5">
        <SectionLabel label="Operações Aduaneiras" />
        <NavLink href="/dashboard/drawback" icon={PackageSearch} label="Drawback"         ativo={pathname.startsWith('/dashboard/drawback')} />
        <NavLink href="/dashboard/cct"      icon={FileCheck2}    label="CCT"              ativo={pathname.startsWith('/dashboard/cct')} />
        <NavLink href="/dashboard/mercante" icon={Anchor}        label="Mercante / AFRMM" ativo={pathname.startsWith('/dashboard/mercante')} />
        <NavLink href="/dashboard/entreposto" icon={Warehouse}   label="Entreposto"       ativo={pathname.startsWith('/dashboard/entreposto')} />
        <NavLink href="/dashboard/ficta"    icon={FileOutput}    label="Op. Ficta"        ativo={pathname.startsWith('/dashboard/ficta')} />
        <NavLink href="/dashboard/lpco"     icon={ShieldCheck}   label="LPCO / Licenças"  ativo={pathname.startsWith('/dashboard/lpco')} />
      </div>

      {/* ── FERRAMENTAS ─────────────────────────────── */}
      <div className="space-y-0.5">
        <SectionLabel label="Ferramentas" />
        <NavLink href="/dashboard/relatorios"   icon={BarChart2}  label="Relatórios"   ativo={pathname.startsWith('/dashboard/relatorios')} />
        <NavLink href="/dashboard/simulador"    icon={Calculator} label="Simulador"    ativo={pathname.startsWith('/dashboard/simulador')} />
        <NavLink href="/dashboard/ia"           icon={Sparkles}   label="IA Comex"     ativo={pathname.startsWith('/dashboard/ia')} />
        <NavLink href="/dashboard/siscomex"     icon={Globe}      label="Siscomex"     ativo={pathname.startsWith('/dashboard/siscomex')} />
        <NavLink href="/dashboard/notificacoes" icon={Bell}       label="Notificações" ativo={pathname.startsWith('/dashboard/notificacoes')} />
      </div>

      {/* ── CONFIGURAÇÕES (fundo) ───────────────────── */}
      <div className="mt-auto space-y-0.5">
        <SectionLabel label="Configurações" />

        {/* Cadastros */}
        <div>
          <button type="button" onClick={() => setCadastrosAberto(v => !v)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
              ${cadastrosAtivo ? 'bg-amber-500/15 text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}>
            <BookOpen size={18} className="shrink-0" />
            <span className="flex-1 text-left">Cadastros</span>
            {cadastrosAberto ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}
          </button>
          {cadastrosAberto && (
            <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 dark:border-white/5 pl-3">
              {CADASTROS_ITEMS.map(({ icon: Icon, label, href }) => (
                <SubLink key={href} href={href} icon={Icon} label={label} ativo={pathname.startsWith(href)} />
              ))}
            </div>
          )}
        </div>

        <NavLink href="/dashboard/usuarios"      icon={Users2}   label="Usuários"      ativo={pathname.startsWith('/dashboard/usuarios')} />
        <NavLink href="/dashboard/configuracoes" icon={Settings} label="Configurações" ativo={pathname.startsWith('/dashboard/configuracoes')} />
      </div>

    </nav>
  )
}


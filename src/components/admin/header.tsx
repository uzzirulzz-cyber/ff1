'use client'

import { useState } from 'react'
import {
  Search,
  Menu,
  Store,
  Plus,
  Mail,
  Bell,
  ChevronDown,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick: () => void
  onReset?: () => void
}

export function Header({ onMenuClick, onReset }: HeaderProps) {
  const [activeTab, setActiveTab] = useState<'Today' | 'Week' | 'Month'>('Week')

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/5 bg-[#070b18]/80 px-4 backdrop-blur-xl lg:px-6">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-slate-300 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-xl md:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search products, orders, customers..."
          className="w-full rounded-xl border border-white/5 bg-white/5 py-2.5 pl-10 pr-16 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-yellow-400/40 focus:bg-white/[0.07]"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:flex">
          <span>Ctrl</span>
          <span>+</span>
          <span>K</span>
        </kbd>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
        {/* Storefront */}
        <button className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 sm:flex">
          <Store className="h-4 w-4 text-slate-300" />
          <span>Storefront</span>
        </button>

        {/* Quick Add */}
        <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-3.5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:shadow-yellow-500/40 hover:brightness-105">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Quick Add</span>
        </button>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <IconBtn icon={Mail} label="Messages" />
          <IconBtn icon={Bell} label="Notifications" badge="3" />
        </div>

        {/* Profile */}
        <button className="ml-1 flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 transition hover:bg-white/5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-sm font-bold text-slate-950">
            P
          </div>
          <div className="hidden text-left leading-tight md:block">
            <div className="text-sm font-semibold text-white">PlayBeat Admin</div>
            <div className="text-[11px] text-slate-400">Administrator</div>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
        </button>
      </div>
    </header>
  )
}

function IconBtn({
  icon: Icon,
  label,
  badge,
}: {
  icon: LucideIcon
  label: string
  badge?: string
}) {
  return (
    <button
      aria-label={label}
      className="relative grid h-9 w-9 place-items-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
    >
      <Icon className="h-[18px] w-[18px]" />
      {badge && (
        <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
          {badge}
        </span>
      )}
    </button>
  )
}

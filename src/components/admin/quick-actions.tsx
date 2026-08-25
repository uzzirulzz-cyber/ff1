'use client'

import { Plus, Megaphone, Store, ShoppingCart, Headphones, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Action {
  label: string
  icon: LucideIcon
  tint: string
}

const ACTIONS: Action[] = [
  { label: 'Add Product', icon: Plus, tint: 'emerald' },
  { label: 'Send Campaign', icon: Megaphone, tint: 'purple' },
  { label: 'View Store', icon: Store, tint: 'blue' },
  { label: 'Manage Orders', icon: ShoppingCart, tint: 'orange' },
  { label: 'Support Tickets', icon: Headphones, tint: 'cyan' },
]

const TINTS: Record<string, string> = {
  emerald: 'hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300',
  purple: 'hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-300',
  blue: 'hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-300',
  orange: 'hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-300',
  cyan: 'hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-300',
}

const ICON_TINTS: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-400',
  purple: 'bg-purple-500/15 text-purple-400',
  blue: 'bg-blue-500/15 text-blue-400',
  orange: 'bg-orange-500/15 text-orange-400',
  cyan: 'bg-cyan-500/15 text-cyan-400',
}

export function QuickActions() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Everything you need, one click away
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            className={cn(
              'group flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left text-slate-300 transition',
              TINTS[a.tint]
            )}
          >
            <div
              className={cn(
                'grid h-9 w-9 shrink-0 place-items-center rounded-lg transition',
                ICON_TINTS[a.tint]
              )}
            >
              <a.icon className="h-[18px] w-[18px]" />
            </div>
            <span className="text-xs font-medium leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

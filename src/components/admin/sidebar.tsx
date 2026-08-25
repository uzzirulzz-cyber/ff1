'use client'

import { useState } from 'react'
import {
  Home,
  LayoutGrid,
  BarChart3,
  ShoppingCart,
  Package,
  KeyRound,
  RefreshCw,
  Tag,
  Users,
  MessageCircle,
  Tv,
  Megaphone,
  Mail,
  Puzzle,
  Settings,
  ScrollText,
  ChevronLeft,
  Play,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  icon: LucideIcon
  badge?: string
  active?: boolean
}

type NavSection = {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', icon: Home, active: true },
    ],
  },
  {
    title: 'Website & Analytics',
    items: [
      { label: 'Website Builder CMS', icon: LayoutGrid },
      { label: 'Analytics & Traffic', icon: BarChart3 },
    ],
  },
  {
    title: 'Commerce & Inventory',
    items: [
      { label: 'Orders & Fulfillment', icon: ShoppingCart, badge: '2' },
      { label: 'Catalog Products', icon: Package, badge: '17' },
      { label: 'Digital License Vault', icon: KeyRound },
      { label: 'Subscriptions', icon: RefreshCw },
      { label: 'Discounts & Coupons', icon: Tag },
    ],
  },
  {
    title: 'Customers & Support',
    items: [
      { label: 'Customer Accounts', icon: Users, badge: '248' },
      { label: 'Support Tickets', icon: MessageCircle, badge: '6' },
    ],
  },
  {
    title: 'IPTV & Services',
    items: [
      { label: 'IPTV M3U Servers', icon: Tv, badge: '3' },
    ],
  },
  {
    title: 'Marketing & Integrations',
    items: [
      { label: 'Marketing Campaigns', icon: Megaphone },
      { label: 'Email Templates', icon: Mail },
      { label: 'Integrations', icon: Puzzle },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', icon: Settings },
      { label: 'Activity Logs', icon: ScrollText },
    ],
  },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onClose: () => void
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onClose }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('Dashboard')

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 z-50 lg:z-30 h-screen shrink-0 flex flex-col',
          'bg-[#0A1020] border-r border-white/5 transition-all duration-300',
          collapsed ? 'w-[76px]' : 'w-[270px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <div className={cn('flex items-center gap-3', collapsed && 'lg:justify-center lg:w-full')}>
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-yellow-300 to-amber-500 shadow-lg shadow-yellow-500/30">
              <Play className="h-5 w-5 fill-slate-950 text-slate-950" />
              {/* soundwave bars */}
              <span className="absolute -right-0.5 -top-0.5 flex h-3 items-end gap-[1.5px]">
                <span className="h-1 w-[2px] rounded-full bg-amber-700/70" />
                <span className="h-2 w-[2px] rounded-full bg-amber-700/70" />
                <span className="h-1.5 w-[2px] rounded-full bg-amber-700/70" />
              </span>
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-extrabold tracking-tight text-white">
                    play
                  </span>
                  <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-lg font-extrabold italic tracking-tight text-transparent">
                    beat
                  </span>
                </div>
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  Digital Pvt Ltd
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onToggle}
            className={cn(
              'hidden lg:grid h-7 w-7 shrink-0 place-items-center rounded-md bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white',
              collapsed && 'lg:hidden'
            )}
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-4">
              {!collapsed && (
                <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = item.label === activeItem
                  return (
                    <button
                      key={item.label}
                      onClick={() => setActiveItem(item.label)}
                      className={cn(
                        'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                        collapsed && 'lg:justify-center lg:px-0',
                        isActive
                          ? 'bg-gradient-to-r from-yellow-300 to-amber-500 text-slate-950 shadow-lg shadow-yellow-500/25'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {/* Decorative wave on right side of active item */}
                      {isActive && !collapsed && (
                        <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-end gap-[2px] lg:flex">
                          <span className="h-2 w-[2px] rounded-full bg-slate-900/40" />
                          <span className="h-3 w-[2px] rounded-full bg-slate-900/40" />
                          <span className="h-4 w-[2px] rounded-full bg-slate-900/40" />
                          <span className="h-2.5 w-[2px] rounded-full bg-slate-900/40" />
                        </span>
                      )}
                      <item.icon className={cn('h-[18px] w-[18px] shrink-0', collapsed && 'lg:mx-auto')} />
                      {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                            isActive
                              ? 'bg-slate-950/15 text-slate-950'
                              : 'bg-yellow-400/15 text-yellow-400'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {/* Tooltip for collapsed */}
                      {collapsed && (
                        <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-xl group-hover:block lg:z-50">
                          {item.label}
                          {item.badge && (
                            <span className="ml-1.5 rounded-full bg-yellow-400/20 px-1.5 py-0.5 text-[10px] text-yellow-400">
                              {item.badge}
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile card */}
        <div className="border-t border-white/5 p-3">
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl bg-white/[0.04] p-3 transition hover:bg-white/[0.07]',
              collapsed && 'lg:justify-center lg:px-0'
            )}
          >
            <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-sm font-bold text-slate-950">
              P
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0A1020] bg-emerald-400" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-sm font-semibold text-white">
                  PlayBeat Digital
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="text-yellow-400">Pro Plan</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400">Online</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

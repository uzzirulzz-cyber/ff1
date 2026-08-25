'use client'

import { useState } from 'react'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
} from 'lucide-react'
import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { WelcomeBanner } from '@/components/admin/welcome-banner'
import { StatCard } from '@/components/admin/stat-card'
import { RevenueChart } from '@/components/admin/revenue-chart'
import { OrderBreakdown } from '@/components/admin/order-breakdown'
import { TrafficSources } from '@/components/admin/traffic-sources'
import { TopProducts } from '@/components/admin/top-products'
import { RecentOrders } from '@/components/admin/recent-orders'
import { SystemHealth } from '@/components/admin/system-health'
import { QuickActions } from '@/components/admin/quick-actions'
import { PromoBanner } from '@/components/admin/promo-banner'

export default function Home() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen bg-[#070b18] text-foreground">
      {/* Background grid pattern */}
      <div className="grid-pattern pointer-events-none fixed inset-0 opacity-40" />

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />

        <main className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] space-y-5 p-4 lg:space-y-6 lg:p-6">
            {/* Welcome */}
            <WelcomeBanner />

            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Revenue"
                value="Rs 44,800"
                delta="+18.4%"
                deltaPositive
                subtext="vs last 7 days"
                icon={DollarSign}
                theme="blue"
                spark={[20, 24, 22, 28, 26, 32, 30, 36, 34, 40, 44]}
              />
              <StatCard
                title="Total Orders"
                value="2"
                delta="+12.1%"
                deltaPositive
                subtext="vs last week"
                icon={ShoppingCart}
                theme="gold"
                spark={[6, 8, 5, 7, 9, 4, 3, 5, 4, 3, 2]}
              />
              <StatCard
                title="Total Products"
                value="17"
                delta="+6.3%"
                deltaPositive
                subtext="new this week"
                icon={Package}
                theme="purple"
                spark={[10, 11, 12, 13, 13, 14, 15, 15, 16, 16, 17]}
              />
              <StatCard
                title="Total Customers"
                value="248"
                delta="+9.7%"
                deltaPositive
                subtext="vs last week"
                icon={Users}
                theme="green"
                spark={[180, 195, 205, 215, 220, 228, 235, 240, 244, 246, 248]}
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <RevenueChart />
              </div>
              <div className="lg:col-span-3">
                <OrderBreakdown />
              </div>
              <div className="lg:col-span-2">
                <TrafficSources />
              </div>
            </div>

            {/* Lists row */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <TopProducts />
              </div>
              <div className="lg:col-span-4">
                <RecentOrders />
              </div>
              <div className="lg:col-span-3">
                <SystemHealth />
              </div>
            </div>

            {/* Quick actions */}
            <QuickActions />

            {/* Promo */}
            <PromoBanner />

            {/* Footer */}
            <footer className="flex flex-col items-center justify-between gap-2 border-t border-white/5 py-5 text-xs text-slate-500 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-400">PlayBeat Digital Pvt Ltd</span>
                <span className="text-slate-600">©</span>
                <span>2026 · All rights reserved.</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="#" className="transition hover:text-slate-300">Privacy</a>
                <a href="#" className="transition hover:text-slate-300">Terms</a>
                <a href="#" className="transition hover:text-slate-300">Support</a>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                  Operational
                </span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}

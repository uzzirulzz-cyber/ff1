'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import { Sidebar } from '@/components/admin/sidebar'
import { Header } from '@/components/admin/header'
import { WelcomeSection } from '@/components/admin/welcome-section'
import { KpiCard } from '@/components/admin/kpi-card'
import { RevenueOverview } from '@/components/admin/revenue-overview'
import { OrderBreakdown } from '@/components/admin/order-breakdown'
import { TrafficSources } from '@/components/admin/traffic-sources'
import { TopProducts } from '@/components/admin/top-products'
import { RecentOrders } from '@/components/admin/recent-orders'
import { SystemHealth } from '@/components/admin/system-health'
import { QuickActions } from '@/components/admin/quick-actions'
import { SmartAdmin } from '@/components/admin/smart-admin'
import { MarketingBanner } from '@/components/admin/marketing-banner'
import { ResetDialog } from '@/components/admin/reset-dialog'
import { useSession } from '@/lib/use-session'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const { user, loading } = useSession()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/admin')
    }
  }, [loading, user, router])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      toast.success('Dashboard data refreshed')
    }, 800)
  }, [])

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070b18] text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
          <div className="text-sm">Loading admin dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen bg-[#070b18] text-foreground">
      <div className="grid-pattern pointer-events-none fixed inset-0 opacity-40" />

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMobileOpen(true)} />

        <main className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] space-y-5 p-4 lg:space-y-6 lg:p-6">
            {/* Top action row: Reset button */}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => setResetOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 hover:border-red-500/40"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Database
              </button>
            </div>

            {/* Welcome */}
            <WelcomeSection onRefresh={handleRefresh} refreshing={refreshing} />

            {/* KPI cards (4) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Total Revenue"
                value="Rs 44,800"
                delta="+18.4%"
                deltaPositive
                subtext="vs last period"
                icon={DollarSign}
                theme="revenue"
                spark={[15, 20, 30, 25, 32, 28, 38, 30, 45, 42, 55, 48, 60, 52, 68]}
              />
              <KpiCard
                title="Total Orders"
                value="2"
                delta="+12.1%"
                deltaPositive
                subtext="vs last period"
                icon={ShoppingCart}
                theme="orders"
                spark={[3, 4, 2, 5, 3, 4, 6, 5, 3, 4, 2, 5, 3, 4, 2]}
              />
              <KpiCard
                title="Total Products"
                value="17"
                subtext="17 published"
                icon={Package}
                theme="products"
                spark={[10, 11, 12, 13, 13, 14, 15, 15, 16, 16, 17, 17, 17, 17, 17]}
              />
              <KpiCard
                title="Low Stock Alerts"
                value="0"
                warning
                icon={AlertTriangle}
                theme="lowstock"
                spark={[5, 4, 3, 4, 2, 3, 2, 1, 2, 1, 1, 0, 1, 0, 0]}
              />
            </div>

            {/* Charts row: Revenue Overview (8) + Order Breakdown (4) */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <RevenueOverview />
              </div>
              <div className="lg:col-span-4">
                <OrderBreakdown />
              </div>
            </div>

            {/* Lists row: Traffic (4) + Top Products (4) + Recent Orders (4) */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <TrafficSources />
              </div>
              <div className="lg:col-span-4">
                <TopProducts />
              </div>
              <div className="lg:col-span-4">
                <RecentOrders />
              </div>
            </div>

            {/* System Health (full width or 12-col) */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <SystemHealth />
              </div>
              <div className="lg:col-span-7">
                <SmartAdmin />
              </div>
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Marketing banner */}
            <MarketingBanner />

            {/* Footer */}
            <footer className="flex flex-col items-center justify-between gap-2 border-t border-white/5 py-5 text-xs text-slate-500 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-400">PlayBeat Digital Pvt Ltd</span>
                <span className="text-slate-600">©</span>
                <span>2026 · All rights reserved.</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="transition hover:text-slate-300">Privacy</a>
                <a href="/legal/terms" target="_blank" rel="noopener noreferrer" className="transition hover:text-slate-300">Terms</a>
                <a href="/legal/refund" target="_blank" rel="noopener noreferrer" className="transition hover:text-slate-300">Refunds</a>
                <a href="/contact" target="_blank" rel="noopener noreferrer" className="transition hover:text-slate-300">Support</a>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                  Operational
                </span>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <ResetDialog open={resetOpen} onOpenChange={setResetOpen} />
    </div>
  )
}

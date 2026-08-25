'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  RotateCcw,
  Loader2,
  AlertCircle,
  ExternalLink,
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
import { ResetDialog } from '@/components/admin/reset-dialog'
import { useSession } from '@/lib/use-session'
import { toast } from 'sonner'

interface DashboardData {
  range: string
  stats: {
    totalRevenue: number
    rangeRevenue: number
    totalOrders: number
    ordersInRange: number
    totalProducts: number
    totalCustomers: number
  }
  breakdown: {
    items: { name: string; value: number; color: string }[]
    total: number
  }
  trend: { date: string; value: number }[]
  recentOrders: {
    id: string
    customer: string
    amount: string
    status: string
  }[]
  topProducts: {
    rank: number
    sku: string
    title: string
    sales: number
    hot: boolean
    price: string
    color: string
  }[]
}

export default function AdminDashboard() {
  const { user, loading } = useSession()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
  const [resetOpen, setResetOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setDataLoading(true)
    setDataError(null)
    try {
      const res = await fetch('/api/dashboard-stats?range=week', { credentials: 'include' })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || 'Failed to load dashboard data')
      }
      const json = await res.json()
      setData(json)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load'
      setDataError(msg)
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/admin')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) fetchData()
  }, [user, fetchData])

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070b18] text-slate-300">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading admin...
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
        <Header onMenuClick={() => setMobileOpen(true)} onReset={() => setResetOpen(true)} />

        <main className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] space-y-5 p-4 lg:space-y-6 lg:p-6">
            {/* Top bar with storefront link + reset */}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <a
                href="/storefront"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Storefront
              </a>
              <button
                onClick={() => setResetOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 hover:border-red-500/40"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Database
              </button>
            </div>

            <WelcomeBanner />

            {dataError ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{dataError}</span>
                <button
                  onClick={fetchData}
                  className="ml-auto rounded-md bg-red-500/20 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/30"
                >
                  Retry
                </button>
              </div>
            ) : dataLoading || !data ? (
              <DashboardSkeleton />
            ) : (
              <>
                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="Total Revenue"
                    value={`Rs ${data.stats.totalRevenue.toLocaleString()}`}
                    delta="+18.4%"
                    deltaPositive
                    subtext="vs last 7 days"
                    icon={DollarSign}
                    theme="blue"
                    spark={data.trend.map((t) => t.value || 0)}
                  />
                  <StatCard
                    title="Total Orders"
                    value={String(data.stats.totalOrders)}
                    delta="+12.1%"
                    deltaPositive
                    subtext="vs last week"
                    icon={ShoppingCart}
                    theme="gold"
                    spark={data.trend.map((_, i) => 6 + Math.floor(Math.random() * 5))}
                  />
                  <StatCard
                    title="Total Products"
                    value={String(data.stats.totalProducts)}
                    delta="+6.3%"
                    deltaPositive
                    subtext="new this week"
                    icon={Package}
                    theme="purple"
                    spark={[10, 11, 12, 13, 13, 14, 15, 15, 16, 16, 17]}
                  />
                  <StatCard
                    title="Total Customers"
                    value={String(data.stats.totalCustomers)}
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
                    <RevenueChart data={data.trend} />
                  </div>
                  <div className="lg:col-span-3">
                    <OrderBreakdown
                      items={data.breakdown.items}
                      total={data.breakdown.total}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <TrafficSources />
                  </div>
                </div>

                {/* Lists row */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    <TopProducts products={data.topProducts} />
                  </div>
                  <div className="lg:col-span-4">
                    <RecentOrders orders={data.recentOrders} />
                  </div>
                  <div className="lg:col-span-3">
                    <SystemHealth />
                  </div>
                </div>
              </>
            )}

            <QuickActions />
            <PromoBanner />

            <footer className="flex flex-col items-center justify-between gap-2 border-t border-white/5 py-5 text-xs text-slate-500 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-400">PlayBeat Digital Pvt Ltd</span>
                <span className="text-slate-600">©</span>
                <span>2026 · All rights reserved.</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="/legal/privacy" target="_blank" className="transition hover:text-slate-300">Privacy</a>
                <a href="/legal/terms" target="_blank" className="transition hover:text-slate-300">Terms</a>
                <a href="/legal/refund" target="_blank" className="transition hover:text-slate-300">Refunds</a>
                <a href="/contact" target="_blank" className="transition hover:text-slate-300">Support</a>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                  Operational
                </span>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <ResetDialog open={resetOpen} onOpenChange={setResetOpen} onDone={fetchData} />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="h-[380px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] lg:col-span-7" />
        <div className="h-[380px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] lg:col-span-3" />
        <div className="h-[380px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.03] lg:col-span-2" />
      </div>
    </div>
  )
}

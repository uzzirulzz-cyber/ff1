'use client'

import { AdminSubPage } from '@/components/admin/admin-sub-page'
import { BarChart3, TrendingUp, Users, Eye, Globe, Smartphone } from 'lucide-react'

export default function AnalyticsPage() {
  const stats = [
    { label: 'Page Views', value: '48,231', change: '+12.4%', icon: Eye, color: 'text-blue-400' },
    { label: 'Unique Visitors', value: '12,847', change: '+8.7%', icon: Users, color: 'text-emerald-400' },
    { label: 'Avg Session', value: '4m 32s', change: '+15.2%', icon: TrendingUp, color: 'text-violet-400' },
    { label: 'Bounce Rate', value: '32.1%', change: '-3.4%', icon: BarChart3, color: 'text-yellow-400' },
  ]

  const trafficSources = [
    { source: 'Direct / URL', visits: 1492, pct: 52, color: '#3b82f6' },
    { source: 'TikTok Leads & Pixel', visits: 832, pct: 28, color: '#a855f7' },
    { source: 'Organic Google Search', visits: 481, pct: 14, color: '#10b981' },
    { source: 'Affiliate Referrals', visits: 172, pct: 6, color: '#facc15' },
  ]

  const topPages = [
    { path: '/', views: 12480, title: 'Home' },
    { path: '/product/ai-001', views: 3421, title: 'Cursor AI Pro' },
    { path: '/product/iptv-008', views: 2187, title: '5Glive IPTV 12M' },
    { path: '/product/proj-004', views: 1932, title: 'Magcubic HY450MAX' },
    { path: '/product/gc-019', views: 1543, title: 'NFLX Gift Card $50' },
  ]

  return (
    <AdminSubPage title="Analytics & Traffic" subtitle="Real-time visitor analytics and traffic sources">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-xs font-semibold text-emerald-400">{s.change}</span>
            </div>
            <div className="mt-3 font-mono text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Traffic sources */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
          <h3 className="text-sm font-bold text-white">Traffic Sources</h3>
          <div className="mt-4 space-y-4">
            {trafficSources.map(t => (
              <div key={t.source}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{t.source}</span>
                  <span className="font-mono font-semibold text-white">{t.pct}% ({t.visits})</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full" style={{ width: `${t.pct}%`, background: t.color, boxShadow: `0 0 8px ${t.color}80` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top pages */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
          <h3 className="text-sm font-bold text-white">Top Pages</h3>
          <div className="mt-4 space-y-2">
            {topPages.map((p, i) => (
              <div key={p.path} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-blue-500/15 font-bold text-blue-400">#{i + 1}</span>
                <span className="flex-1 truncate font-mono text-slate-300">{p.path}</span>
                <span className="font-mono font-semibold text-white">{p.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device breakdown */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <h3 className="text-sm font-bold text-white">Device Breakdown</h3>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <Smartphone className="mx-auto h-6 w-6 text-blue-400" />
            <div className="mt-2 font-mono text-xl font-bold text-white">58%</div>
            <div className="text-xs text-slate-400">Mobile</div>
          </div>
          <div className="text-center">
            <BarChart3 className="mx-auto h-6 w-6 text-violet-400" />
            <div className="mt-2 font-mono text-xl font-bold text-white">32%</div>
            <div className="text-xs text-slate-400">Desktop</div>
          </div>
          <div className="text-center">
            <Globe className="mx-auto h-6 w-6 text-emerald-400" />
            <div className="mt-2 font-mono text-xl font-bold text-white">10%</div>
            <div className="text-xs text-slate-400">Tablet</div>
          </div>
        </div>
      </div>
    </AdminSubPage>
  )
}

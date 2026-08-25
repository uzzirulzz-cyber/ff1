'use client'

import { AdminSubPage } from '@/components/admin/admin-sub-page'
import { FileBarChart, Download, DollarSign, ShoppingCart, Package, Users } from 'lucide-react'

export default function ReportsPage() {
  const reports = [
    { name: 'Sales Report', desc: 'Revenue, orders, and top products', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Inventory Report', desc: 'Stock levels and low-stock alerts', icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Customer Report', desc: 'New customers, retention, LTV', icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { name: 'Order Fulfillment', desc: 'Processing times and status breakdown', icon: ShoppingCart, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { name: 'Product Performance', desc: 'Best sellers, trending, and ratings', icon: FileBarChart, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { name: 'Financial Summary', desc: 'Revenue, costs, and profit margins', icon: DollarSign, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ]

  const recentExports = [
    { name: 'Sales Report — Aug 2026', date: 'Aug 25, 2026', size: '2.4 MB', format: 'CSV' },
    { name: 'Customer Report — Aug 2026', date: 'Aug 24, 2026', size: '1.1 MB', format: 'XLSX' },
    { name: 'Inventory Report — Aug 2026', date: 'Aug 23, 2026', size: '0.8 MB', format: 'CSV' },
  ]

  return (
    <AdminSubPage title="Reports" subtitle="Generate and download business reports">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map(r => (
          <button key={r.name} className="group flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-left transition hover:border-blue-500/30 hover:bg-white/[0.06]">
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${r.bg}`}>
              <r.icon className={`h-5 w-5 ${r.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white">{r.name}</div>
              <div className="mt-0.5 text-xs text-slate-400">{r.desc}</div>
            </div>
            <Download className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-blue-400" />
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <h3 className="text-sm font-bold text-white">Recent Exports</h3>
        <div className="mt-4 space-y-2">
          {recentExports.map((e, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs">
              <FileBarChart className="h-4 w-4 text-slate-400" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-white">{e.name}</div>
                <div className="text-slate-500">{e.date} · {e.size} · {e.format}</div>
              </div>
              <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminSubPage>
  )
}

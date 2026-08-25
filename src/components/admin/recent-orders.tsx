'use client'

import { ListOrdered, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Status = 'Completed' | 'Processing' | 'Pending' | 'Cancelled' | 'completed' | 'processing' | 'pending' | 'cancelled'

interface Order {
  id: string
  customer: string
  amount: string
  status: string
}

interface RecentOrdersProps {
  orders?: Order[]
}

const FALLBACK: Order[] = [
  { id: '#PB-00024', customer: 'John Doe', amount: 'Rs 2,499', status: 'Completed' },
  { id: '#PB-00023', customer: 'Sarah Smith', amount: 'Rs 1,499', status: 'Completed' },
  { id: '#PB-00022', customer: 'Mike Johnson', amount: 'Rs 1,299', status: 'Completed' },
  { id: '#PB-00021', customer: 'Emma Wilson', amount: 'Rs 3,200', status: 'Processing' },
  { id: '#PB-00020', customer: 'David Brown', amount: 'Rs 899', status: 'Pending' },
]

const STATUS_STYLES: Record<string, string> = {
  Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const normalizeStatus = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

export function RecentOrders({ orders = FALLBACK }: RecentOrdersProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
        </div>
        <a
          href="/admin/orders"
          className="flex items-center gap-1 text-xs font-medium text-yellow-400 transition hover:text-yellow-300"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="mt-4 -mx-2 flex-1">
        {/* Header row */}
        <div className="hidden grid-cols-[100px_1fr_90px_90px] gap-2 px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 md:grid">
          <span>Order ID</span>
          <span>Customer</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Status</span>
        </div>
        <div className="space-y-1">
          {orders.map((o) => {
            const normalized = normalizeStatus(o.status)
            return (
              <div
                key={o.id}
                className="grid grid-cols-2 items-center gap-2 rounded-xl px-2 py-2.5 transition hover:bg-white/[0.04] md:grid-cols-[100px_1fr_90px_90px]"
              >
                <div className="font-mono text-xs font-medium text-slate-300">
                  {o.id}
                </div>
                <div className="flex items-center gap-2 text-sm text-white">
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/5 text-[10px] font-bold text-slate-300">
                    {o.customer.charAt(0)}
                  </div>
                  <span className="truncate">{o.customer}</span>
                </div>
                <div className="text-right font-mono text-xs font-semibold text-white">
                  {o.amount}
                </div>
                <div className="flex justify-end">
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                      STATUS_STYLES[o.status] || STATUS_STYLES[normalized] || 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                    )}
                  >
                    {normalized}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

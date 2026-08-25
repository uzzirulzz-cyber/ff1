'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Package, ChevronDown } from 'lucide-react'

interface BreakdownItem {
  name: string
  value: number
  color: string
}

interface OrderBreakdownProps {
  items?: BreakdownItem[]
  total?: number
}

const FALLBACK = [
  { name: 'Completed', value: 1, color: '#3b82f6' },
  { name: 'Processing', value: 1, color: '#10b981' },
  { name: 'Pending', value: 0, color: '#facc15' },
]

export function OrderBreakdown({ items = FALLBACK, total }: OrderBreakdownProps) {
  const computedTotal = total ?? items.reduce((s, d) => s + d.value, 0)
  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Order Breakdown</h3>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10">
          This Week
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </div>

      <div className="relative mt-4 h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="value"
              innerRadius={58}
              outerRadius={78}
              paddingAngle={2}
              cornerRadius={8}
              startAngle={90}
              endAngle={-270}
            >
              {items.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={entry.color}
                  stroke="transparent"
                  opacity={entry.value > 0 ? 1 : 0.18}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-mono text-4xl font-bold text-white">{computedTotal}</div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            Total Orders
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((d) => {
          const pct = computedTotal > 0 ? Math.round((d.value / computedTotal) * 100) : 0
          return (
            <div
              key={d.name}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-slate-300">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-white">{d.value}</span>
                <span className="text-slate-500">({pct}%)</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

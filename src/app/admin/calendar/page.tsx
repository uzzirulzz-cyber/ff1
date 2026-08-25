'use client'

import { AdminSubPage } from '@/components/admin/admin-sub-page'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const events: Record<number, { title: string; color: string }[]> = {
    5: [{ title: 'Flash Sale Ends', color: 'bg-red-500/20 text-red-400' }],
    12: [{ title: 'New Product Launch', color: 'bg-blue-500/20 text-blue-400' }],
    18: [{ title: 'Inventory Check', color: 'bg-yellow-400/20 text-yellow-400' }],
    25: [{ title: 'Monthly Report', color: 'bg-emerald-500/20 text-emerald-400' }],
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  function prevMonth() { setCurrentDate(new Date(year, month - 1, 1)) }
  function nextMonth() { setCurrentDate(new Date(year, month + 1, 1)) }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const today = new Date()
  const isToday = (d: number) => today.getDate() === d && today.getMonth() === month && today.getFullYear() === year

  return (
    <AdminSubPage
      title="Calendar"
      subtitle="Schedule events, promotions, and inventory checks"
      actions={
        <button className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-3.5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:brightness-105">
          <Plus className="h-4 w-4" /> New Event
        </button>
      }
    >
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">{monthNames[month]} {year}</h3>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={nextMonth} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => (
            <div
              key={i}
              className={`min-h-[80px] rounded-lg border p-1.5 ${
                d === null
                  ? 'border-transparent'
                  : isToday(d)
                  ? 'border-blue-500/40 bg-blue-500/5'
                  : 'border-white/5 bg-white/[0.02]'
              }`}
            >
              {d && (
                <>
                  <div className={`text-xs font-medium ${isToday(d) ? 'text-blue-400' : 'text-slate-400'}`}>{d}</div>
                  {events[d] && (
                    <div className="mt-1 space-y-0.5">
                      {events[d].map((e, j) => (
                        <div key={j} className={`rounded px-1 py-0.5 text-[9px] font-medium ${e.color}`}>
                          {e.title}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminSubPage>
  )
}

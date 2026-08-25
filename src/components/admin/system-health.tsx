'use client'

import { Activity, CheckCircle2 } from 'lucide-react'

const SERVICES = [
  'Web Server',
  'Database',
  'Payment Gateway',
  'Email Service',
  'IPTV Services',
]

export function SystemHealth() {
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const percent = 100
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">System Health</h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
          All Systems Operational
        </span>
      </div>

      {/* Gauge */}
      <div className="relative mx-auto mt-4 grid h-[140px] w-[140px] place-items-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
            fill="none"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="url(#healthGrad)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))' }}
          />
          <defs>
            <linearGradient id="healthGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
        <div className="text-center">
          <div className="font-mono text-2xl font-bold text-white">100%</div>
          <div className="text-[10px] uppercase tracking-wide text-emerald-400">
            Healthy
          </div>
        </div>
        {/* EKG line */}
        <svg
          className="pointer-events-none absolute inset-x-2 bottom-3 h-6"
          viewBox="0 0 200 30"
          preserveAspectRatio="none"
        >
          <polyline
            className="ekg-line"
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
            points="0,15 30,15 40,15 45,5 50,25 55,15 90,15 100,15 105,5 110,25 115,15 150,15 160,15 165,5 170,25 175,15 200,15"
          />
        </svg>
      </div>

      {/* Services */}
      <div className="mt-4 space-y-1.5">
        {SERVICES.map((s) => (
          <div
            key={s}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs transition hover:bg-white/[0.04]"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-300">{s}</span>
            </div>
            <span className="font-medium text-emerald-400">Online</span>
          </div>
        ))}
      </div>
    </div>
  )
}

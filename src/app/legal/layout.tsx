import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-[#070b18] text-white">
      {/* Background grid + glows */}
      <div className="grid-pattern pointer-events-none fixed inset-0 opacity-30" />
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#070b18]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 lg:px-6">
          <Link href="/storefront" className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
              <img
                src="/playbeat-logo.png"
                alt="PlayBeat 2"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-sm font-extrabold italic tracking-tight text-transparent">
                  PlayBeat
                </span>
                <span className="rounded bg-yellow-400/20 px-1 text-[10px] font-bold text-yellow-400">
                  2
                </span>
                <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Legal
                </span>
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Digital Pvt Ltd
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/legal"
              className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10 sm:flex"
            >
              All Policies
            </Link>
            <Link
              href="/storefront"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:brightness-105"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative">{children}</main>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-500 sm:flex-row lg:px-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">
              PlayBeat Digital Pvt Ltd
            </span>
            <span>© 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/legal/privacy" className="transition hover:text-slate-300">
              Privacy
            </Link>
            <Link href="/legal/terms" className="transition hover:text-slate-300">
              Terms
            </Link>
            <Link href="/legal/refund" className="transition hover:text-slate-300">
              Refunds
            </Link>
            <Link href="/contact" className="transition hover:text-slate-300">
              Contact
            </Link>
            <Link href="/login" className="transition hover:text-slate-300">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

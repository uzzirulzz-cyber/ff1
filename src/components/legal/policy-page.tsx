import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft, FileText, Calendar, Home } from 'lucide-react'

export interface PolicySection {
  heading: string
  body?: ReactNode
}

export interface PolicyPageProps {
  title: string
  effectiveDate?: string
  intro?: ReactNode
  sections: PolicySection[]
  /** Sibling policy links to show at the bottom */
  relatedLinks?: { href: string; label: string }[]
}

export function PolicyPage({
  title,
  effectiveDate,
  intro,
  sections,
  relatedLinks = [],
}: PolicyPageProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 pb-16 pt-8 lg:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
        <Link
          href="/storefront"
          className="flex items-center gap-1 transition hover:text-slate-300"
        >
          <Home className="h-3 w-3" />
          Store
        </Link>
        <span className="text-slate-600">/</span>
        <Link href="/legal" className="transition hover:text-slate-300">
          Legal
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-slate-400">{title}</span>
      </nav>

      {/* Title block */}
      <header className="mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-yellow-400">
          <FileText className="h-3.5 w-3.5" />
          Legal Document
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
          {title}
        </h1>
        {effectiveDate && (
          <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>Effective Date: {effectiveDate}</span>
          </div>
        )}
      </header>

      {/* Intro */}
      {intro && (
        <div className="mb-8 rounded-2xl border border-yellow-400/15 bg-yellow-400/[0.04] p-5 text-sm leading-relaxed text-slate-300">
          {intro}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((s, i) => (
          <section key={i} className="scroll-mt-20">
            <h2 className="mb-3 flex items-baseline gap-3 text-lg font-bold text-white">
              <span className="font-mono text-xs text-yellow-400/70">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{s.heading}</span>
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-300 [&_a]:text-yellow-400 [&_a]:underline [&_a]:decoration-yellow-400/40 [&_a]:transition [&_a:hover]:decoration-yellow-400 [&_li]:leading-relaxed [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:marker:text-slate-600">
              {s.body}
            </div>
          </section>
        ))}
      </div>

      {/* Contact card */}
      <section className="mt-12 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <h3 className="text-base font-bold text-white">Contact</h3>
        <p className="mt-2 text-sm text-slate-400">
          For questions about this policy, contact PlayBeat Digital:
        </p>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div className="space-y-1">
            <div className="font-semibold text-white">PlayBeat Digital</div>
            <div className="text-slate-400">
              House 334, Street 06, Jinnahabad
              <br />
              Abbottabad, Khyber Pakhtunkhwa
              <br />
              Pakistan · Postal Code: 22010
            </div>
          </div>
          <div className="space-y-1">
            <a
              href="mailto:playbeatdigital@proton.me"
              className="block text-yellow-400 transition hover:text-yellow-300"
            >
              playbeatdigital@proton.me
            </a>
            <div className="text-slate-400">Mobile / WhatsApp: 0331-8333368</div>
            <div className="text-slate-400">Landline: 0992-338830</div>
            <Link
              href="/contact"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-yellow-400 transition hover:text-yellow-300"
            >
              All contact channels →
            </Link>
          </div>
        </div>
      </section>

      {/* Related policies */}
      {relatedLinks.length > 0 && (
        <section className="mt-8">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Related Policies
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {relatedLinks.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-sm transition hover:border-yellow-400/30 hover:bg-yellow-400/[0.04]"
              >
                <span className="text-slate-300 group-hover:text-white">
                  {r.label}
                </span>
                <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-slate-500 transition group-hover:text-yellow-400" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
        <Link
          href="/legal"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          All Legal Documents
        </Link>
        <Link
          href="/storefront"
          className="text-sm font-medium text-yellow-400 transition hover:text-yellow-300"
        >
          Back to Store →
        </Link>
      </div>
    </article>
  )
}

/** Helper for bullet lists */
export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul>
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  )
}

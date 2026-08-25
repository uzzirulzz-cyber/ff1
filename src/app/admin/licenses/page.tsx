'use client'

import { AdminSubPage } from '@/components/admin/admin-sub-page'
import { Construction } from 'lucide-react'

export default function LicensesPage() {
  return (
    <AdminSubPage title="Licenses" subtitle="Manage your licenses">
      <div className="grid h-64 place-items-center rounded-2xl border border-white/5 bg-white/[0.03]">
        <div className="text-center">
          <Construction className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-3 text-sm font-medium text-slate-400">Licenses module</p>
          <p className="mt-1 text-xs text-slate-500">This section is being prepared. Data will load from the admin system.</p>
        </div>
      </div>
    </AdminSubPage>
  )
}

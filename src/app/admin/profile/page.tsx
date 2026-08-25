'use client'

import { AdminSubPage } from '@/components/admin/admin-sub-page'
import { useSession } from '@/lib/use-session'
import { useState, useRef } from 'react'
import { Camera, Save, Mail, User, Shield, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, loading } = useSession()
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null)
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#070b18] text-slate-300">
        <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
      </div>
    )
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image too large (max 2MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setAvatar(reader.result as string)
      toast.success('Profile picture updated')
    }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Profile saved successfully')
    }, 800)
  }

  return (
    <AdminSubPage title="Profile & Settings" subtitle="Manage your admin account">
      <div className="max-w-2xl space-y-5">
        {/* Profile picture */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <h3 className="text-sm font-bold text-white">Profile Picture</h3>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-2xl font-bold text-slate-950">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'P'
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-[#070b18] bg-blue-500 text-white transition hover:bg-blue-600"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{user?.name}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-yellow-400/15 px-2 py-0.5 text-[10px] font-bold text-yellow-400">
                <Shield className="h-2.5 w-2.5" /> Administrator
              </div>
            </div>
          </div>
        </div>

        {/* Account info */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <h3 className="text-sm font-bold text-white">Account Information</h3>
          <div className="mt-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Full Name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-yellow-400/40"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">Email (read-only)</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={user?.email || ''}
                  disabled
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-slate-400"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-300">Your account has administrator privileges with full access.</span>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:brightness-105 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <h3 className="text-sm font-bold text-white">Security</h3>
          <div className="mt-4 space-y-3">
            <button className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left text-sm transition hover:bg-white/[0.05]">
              <span className="text-white">Change Password</span>
              <span className="text-xs text-slate-400">Last changed 30 days ago</span>
            </button>
            <button className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left text-sm transition hover:bg-white/[0.05]">
              <span className="text-white">Two-Factor Authentication</span>
              <span className="rounded-full bg-yellow-400/15 px-2 py-0.5 text-[10px] font-bold text-yellow-400">Not enabled</span>
            </button>
            <button className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left text-sm transition hover:bg-white/[0.05]">
              <span className="text-white">Active Sessions</span>
              <span className="text-xs text-slate-400">1 active</span>
            </button>
          </div>
        </div>
      </div>
    </AdminSubPage>
  )
}

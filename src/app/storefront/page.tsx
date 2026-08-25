'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ShoppingCart,
  Search,
  Loader2,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Shield,
  Zap,
  Headphones,
  Tag,
  ExternalLink,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface StoreProduct {
  id: string
  sku: string
  name: string
  description?: string | null
  category?: string | null
  price: number
  currency: string
  stock: number
  image?: string | null
  tags: string[]
  digital: boolean
}

interface CartItem extends StoreProduct {
  qty: number
}

export default function StorefrontPage() {
  const [products, setProducts] = useState<StoreProduct[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<{ orderNumber: string; total: number } | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      if (search) params.set('search', search)
      const res = await fetch(`/api/storefront/products?${params}`)
      const data = await res.json()
      if (data?.ok) {
        setProducts(data.data || [])
        setCategories(data.categories || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [category, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Load cart from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pb_cart')
      if (raw) setCart(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('pb_cart', JSON.stringify(cart))
    } catch {
      // ignore
    }
  }, [cart])

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0)
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  function addToCart(p: StoreProduct) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === p.id)
      if (existing) {
        return prev.map((c) =>
          c.id === p.id ? { ...c, qty: Math.min(c.qty + 1, p.stock) } : c
        )
      }
      return [...prev, { ...p, qty: 1 }]
    })
    toast.success(`${p.name} added to cart`)
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id !== id) return c
          const next = Math.max(0, Math.min(c.qty + delta, c.stock))
          return { ...c, qty: next }
        })
        .filter((c) => c.qty > 0)
    )
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((c) => c.id !== id))
  }

  async function handleCheckout(name: string, email: string) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/storefront/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email || null,
          items: cart.map((c) => ({ productId: c.id, qty: c.qty })),
          paymentMethod: 'Card',
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Checkout failed')
      }
      setConfirmation(data.data)
      setCart([])
      setCheckoutOpen(false)
      toast.success('Order placed successfully!')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Checkout failed'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#070b18] text-white">
      <div className="grid-pattern pointer-events-none fixed inset-0 opacity-30" />
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#070b18]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <Link href="/storefront" className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
              <img src="/playbeat-logo.png" alt="PlayBeat 2" className="h-9 w-9 object-contain" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-base font-extrabold italic tracking-tight text-transparent">
                  PlayBeat
                </span>
                <span className="rounded bg-yellow-400/20 px-1 text-xs font-bold text-yellow-400">2</span>
              </div>
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Digital Store
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 sm:flex"
            >
              Admin Login
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-3.5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:brightness-105"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-slate-950 px-1 text-[10px] font-bold text-yellow-300">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/20 bg-yellow-400/5 px-3 py-1 text-xs font-medium text-yellow-300">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
              Instant Digital Delivery · 24/7
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight lg:text-5xl">
              Digital products,
              <br />
              <span className="text-gradient-gold">delivered instantly.</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-slate-400">
              Gift cards, streaming subscriptions, IPTV, VPN & more.
              Pay securely and receive your codes within minutes.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#products"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:brightness-105"
              >
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </a>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  Secure Checkout
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-yellow-400" />
                  Instant Delivery
                </span>
                <span className="flex items-center gap-1">
                  <Headphones className="h-3.5 w-3.5 text-blue-400" />
                  24/7 Support
                </span>
              </div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="grid h-80 place-items-center rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent">
              <img src="/playbeat-logo.png" alt="PlayBeat" className="h-40 w-auto object-contain opacity-90" />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-4 pb-6 lg:px-6" id="products">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">All Products</h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {loading ? 'Loading...' : `${products.length} products available`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-yellow-400/40 focus:bg-white/[0.07] sm:w-64"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-yellow-400/40"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-6">
        {loading ? (
          <div className="grid h-64 place-items-center text-sm text-slate-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="grid h-64 place-items-center text-sm text-slate-400">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition hover:bg-white/[0.06] hover:shadow-lg hover:shadow-yellow-500/5"
              >
                {/* Image / placeholder */}
                <div className="relative grid aspect-video place-items-center overflow-hidden bg-gradient-to-br from-slate-700/30 to-slate-800/50">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/5">
                      <Tag className="h-7 w-7 text-slate-400" />
                    </div>
                  )}
                  {p.digital && (
                    <span className="absolute right-2 top-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-md">
                      DIGITAL
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-yellow-400">
                    {p.category || 'Digital'}
                  </div>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-white">
                    {p.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                    {p.description || 'Premium digital product with instant delivery.'}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="font-mono text-lg font-bold text-white">
                      {p.currency} {p.price.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {p.stock > 0 ? `${p.stock} in stock` : 'Sold out'}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.stock <= 0}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-yellow-500/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-slate-500 sm:flex-row lg:px-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">PlayBeat Digital Pvt Ltd</span>
            <span>© 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="transition hover:text-slate-300">Privacy</a>
            <a href="#" className="transition hover:text-slate-300">Terms</a>
            <a href="/login" className="transition hover:text-slate-300">Admin</a>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        cart={cart}
        total={cartTotal}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onCheckout={() => {
          setCartOpen(false)
          setCheckoutOpen(true)
        }}
      />

      {/* Checkout dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        total={cartTotal}
        submitting={submitting}
        onCheckout={handleCheckout}
      />

      {/* Confirmation dialog */}
      <Dialog open={!!confirmation} onOpenChange={(v) => !v && setConfirmation(null)}>
        <DialogContent className="border-emerald-500/30 bg-[#0f172a]/95 text-white backdrop-blur-xl">
          <DialogHeader>
            <div className="mb-2 grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </div>
            <DialogTitle className="text-xl font-bold">Order Placed!</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            Your order has been received and is now pending. You&apos;ll receive
            your digital products via email shortly.
          </p>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Order Number</span>
              <span className="font-mono font-bold text-yellow-400">
                {confirmation?.orderNumber}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-400">Total</span>
              <span className="font-mono font-bold text-white">
                Rs {confirmation?.total.toLocaleString()}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setConfirmation(null)}
              className="bg-gradient-to-r from-yellow-300 to-amber-500 text-slate-950 hover:brightness-105"
            >
              Continue Shopping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Cart Drawer
function CartDrawer({
  open,
  onOpenChange,
  cart,
  total,
  onUpdateQty,
  onRemove,
  onCheckout,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  cart: CartItem[]
  total: number
  onUpdateQty: (id: string, delta: number) => void
  onRemove: (id: string) => void
  onCheckout: () => void
}) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => onOpenChange(false)}
      />
      <aside
        className={cn(
          'absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#0A1020] border-l border-white/5 transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-white/5 p-4">
          <h3 className="flex items-center gap-2 text-base font-bold">
            <ShoppingCart className="h-5 w-5 text-yellow-400" />
            Your Cart ({cart.length})
          </h3>
          <button
            onClick={() => onOpenChange(false)}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="grid h-40 place-items-center text-center text-sm text-slate-400">
              <div>
                <ShoppingCart className="mx-auto h-10 w-10 text-slate-600" />
                <p className="mt-2">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 text-[10px] font-bold text-slate-300">
                    {c.name.split(' ')[0].slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-white">
                      {c.name}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-yellow-400">
                      {c.currency} {c.price.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateQty(c.id, -1)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-mono text-white">
                      {c.qty}
                    </span>
                    <button
                      onClick={() => onUpdateQty(c.id, 1)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => onRemove(c.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-white/5 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-slate-400">Total</span>
              <span className="font-mono text-xl font-bold text-white">
                Rs {total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-yellow-500/25 transition hover:brightness-105"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

function CheckoutDialog({
  open,
  onOpenChange,
  total,
  submitting,
  onCheckout,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  total: number
  submitting: boolean
  onCheckout: (name: string, email: string) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-[#0f172a]/95 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Checkout</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onCheckout(name, email)
          }}
          className="space-y-3"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Full Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-yellow-400/40 focus:bg-white/[0.07]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-yellow-400/40 focus:bg-white/[0.07]"
            />
            <p className="text-[11px] text-slate-500">
              We&apos;ll send your digital products to this email.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total</span>
              <span className="font-mono text-lg font-bold text-white">
                Rs {total.toLocaleString()}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="gap-2 bg-gradient-to-r from-yellow-300 to-amber-500 text-slate-950 hover:brightness-105"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Place Order · Rs {total.toLocaleString()}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

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
  ArrowRight,
  Heart,
  Eye,
  ChevronDown,
  Flame,
  Crown,
  TrendingUp,
  Star,
  Sparkles,
  Tv,
  Package,
  KeyRound,
  Gift,
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
import {
  formatPrice,
  type CurrencyCode,
  SUPPORTED_CURRENCIES,
  CURRENCY_LABELS,
} from '@/lib/currency'

interface StoreProduct {
  id: string
  sku: string
  name: string
  description?: string | null
  category?: string | null
  price: number
  currency: string
  originalPrice?: number | null
  originalCurrency?: string | null
  region?: string | null
  stock: number
  image?: string | null
  tags: string[]
  digital: boolean
}

interface CartItem extends StoreProduct {
  qty: number
}

const CART_STORAGE_KEY = 'pb_cart_v2'
const CURRENCY_STORAGE_KEY = 'pb_currency'

// Category metadata for visual treatment
const CATEGORY_META: Record<string, { icon: typeof Tv; accent: string; bg: string }> = {
  'AI & Productivity': { icon: Sparkles, accent: 'text-pb-gold', bg: 'bg-pb-gold-soft' },
  'Video Editing': { icon: Tv, accent: 'text-pb-blue', bg: 'bg-blue-500/10' },
  'Email Accounts': { icon: KeyRound, accent: 'text-pb-emerald', bg: 'bg-emerald-500/10' },
  'IPTV': { icon: Tv, accent: 'text-pb-red', bg: 'bg-red-500/10' },
  'Streaming Accounts': { icon: Play, accent: 'text-pb-red', bg: 'bg-red-500/10' },
  'Gift Cards': { icon: Gift, accent: 'text-pb-gold', bg: 'bg-pb-gold-soft' },
}

function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

export function Storefront() {
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
  const [currency, setCurrency] = useState<CurrencyCode>('PKR')
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null
      if (saved && SUPPORTED_CURRENCIES.includes(saved)) setCurrency(saved)
      const wish = localStorage.getItem('pb_wishlist')
      if (wish) setWishlist(new Set(JSON.parse(wish)))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
      localStorage.setItem('pb_wishlist', JSON.stringify([...wishlist]))
    } catch {
      // ignore
    }
  }, [currency, wishlist])

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY)
      if (raw) setCart(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {
      // ignore
    }
  }, [cart])

  const cartTotalUSD = cart.reduce((s, c) => s + c.price * c.qty, 0)
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
    toast.success(`${p.name.slice(0, 40)}${p.name.length > 40 ? '...' : ''} added to cart`)
  }

  function toggleWishlist(id: string) {
    setWishlist((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        toast.success('Added to wishlist')
      }
      return next
    })
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
    <div className="relative min-h-screen bg-[#0A0A0A] text-pb-silver">
      {/* Background layers */}
      <div className="pb-grid-bg pointer-events-none fixed inset-0 opacity-50" />
      <div className="pb-noise pointer-events-none fixed inset-0 opacity-30" />

      {/* Top announcement bar */}
      <div className="relative z-20 bg-gradient-to-r from-pb-red via-pb-red-bright to-pb-red text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-[11px] font-medium lg:text-xs">
          <Flame className="h-3 w-3 shrink-0 animate-pulse-soft" />
          <span>
            <span className="font-bold">LIMITED TIME</span> ⚡{' '}
            <span className="font-semibold">FLASH SALE:</span> Get 15% OFF across all digital keys with code{' '}
            <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono font-bold">PLAYBEAT15</span> — Instant 24/7 Automated Delivery
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-pb-line bg-[#0A0A0A]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
              <img src="/playbeat-logo.png" alt="PlayBeat 2" className="h-8 w-8 object-contain" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-base font-extrabold tracking-tight text-white">PlayBeat</span>
                <span className="rounded bg-pb-gold/20 px-1 text-[10px] font-bold text-pb-gold">2</span>
              </div>
              <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-pb-silver-3">
                Digital Marketplace
              </div>
            </div>
          </Link>

          {/* Search (desktop) */}
          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pb-silver-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Trending: IPTV · Gift Cards · AI Tools..."
              className="w-full rounded-xl border border-pb-line bg-pb-charcoal py-2 pl-10 pr-3 text-sm text-pb-silver placeholder:text-pb-silver-4 outline-none transition focus:border-pb-gold/40 focus:bg-pb-charcoal-2"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Currency switcher */}
            <div className="relative">
              <button
                onClick={() => setCurrencyOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl border border-pb-line bg-pb-charcoal px-3 py-2 text-xs font-semibold text-pb-silver transition hover:border-pb-gold/40 hover:bg-pb-charcoal-2"
              >
                <span className="text-pb-gold">{currency}</span>
                <ChevronDown className="h-3 w-3 text-pb-silver-3" />
              </button>
              {currencyOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCurrencyOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-pb-line bg-pb-charcoal py-1 pb-shadow-lg">
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCurrency(c)
                          setCurrencyOpen(false)
                          toast.success(`Currency: ${c}`)
                        }}
                        className={cn(
                          'flex w-full items-center justify-between px-3 py-2 text-xs transition hover:bg-pb-charcoal-2',
                          currency === c ? 'text-pb-gold' : 'text-pb-silver-2'
                        )}
                      >
                        <span>{CURRENCY_LABELS[c]}</span>
                        {currency === c && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-xl bg-pb-gradient-gold px-3.5 py-2 text-sm font-bold text-pb-ink shadow-lg shadow-pb-gold/25 transition hover:brightness-105"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-pb-ink px-1 text-[10px] font-bold text-pb-gold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category pills row (desktop) */}
        <div className="border-t border-pb-line/50 bg-pb-ink/50">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 scrollbar-thin lg:px-6">
            <button
              onClick={() => setCategory('all')}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                category === 'all'
                  ? 'bg-pb-gold text-pb-ink'
                  : 'text-pb-silver-2 hover:bg-pb-charcoal-2 hover:text-pb-silver'
              )}
            >
              All Assets
            </button>
            {categories.sort().map((c) => {
              const meta = CATEGORY_META[c] || { icon: Tag, accent: 'text-pb-silver', bg: 'bg-pb-charcoal-2' }
              const Icon = meta.icon
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                    category === c
                      ? 'bg-pb-gold text-pb-ink'
                      : 'text-pb-silver-2 hover:bg-pb-charcoal-2 hover:text-pb-silver'
                  )}
                >
                  <Icon className={cn('h-3 w-3', category === c ? 'text-pb-ink' : meta.accent)} />
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-pb-line">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-pb-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-pb-blue/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-pb-gold/30 bg-pb-gold/5 px-3 py-1 text-xs font-medium text-pb-gold">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-pb-emerald" />
                VERIFIED DIGITAL MARKETPLACE · INSTANT KEY DISPATCH
              </div>
              <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Premium digital access,
                <br />
                <span className="pb-text-gold">beautifully delivered.</span>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-pb-silver-2 lg:text-base">
                Instant game licenses, verified SaaS subscriptions, ultra IPTV & flagship Smart
                Projectors — backed by 24/7 automated delivery and buyer protection.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#products"
                  className="inline-flex items-center gap-2 rounded-xl bg-pb-gradient-gold px-5 py-3 text-sm font-bold text-pb-ink shadow-lg shadow-pb-gold/25 transition hover:brightness-105"
                >
                  Shop Instant Keys
                  <ArrowRight className="h-4 w-4" />
                </a>
                <div className="flex flex-wrap items-center gap-4 text-xs text-pb-silver-3">
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-pb-emerald" />
                    Buyer Protection
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-pb-gold" />
                    Instant Delivery
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Headphones className="h-3.5 w-3.5 text-pb-blue" />
                    24/7 Concierge
                  </span>
                </div>
              </div>
            </div>

            {/* Stats / hero card */}
            <div className="relative hidden lg:block">
              <div className="rounded-2xl border border-pb-line bg-gradient-to-br from-pb-charcoal to-pb-ink p-6 pb-shadow-lg">
                <div className="flex items-center justify-between border-b border-pb-line pb-3">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-pb-silver-3">
                      Live Marketplace
                    </div>
                    <div className="mt-0.5 font-mono text-2xl font-bold text-white">
                      {products.length}+ Assets
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-pb-emerald/10 px-2 py-1 text-xs font-semibold text-pb-emerald">
                    <TrendingUp className="h-3 w-3" />
                    LIVE
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-pb-line bg-pb-charcoal-2 p-3">
                    <div className="font-mono text-xl font-bold text-pb-gold">24/7</div>
                    <div className="text-[10px] uppercase tracking-wider text-pb-silver-3">Auto Delivery</div>
                  </div>
                  <div className="rounded-xl border border-pb-line bg-pb-charcoal-2 p-3">
                    <div className="font-mono text-xl font-bold text-pb-blue">100%</div>
                    <div className="text-[10px] uppercase tracking-wider text-pb-silver-3">Authentic</div>
                  </div>
                  <div className="rounded-xl border border-pb-line bg-pb-charcoal-2 p-3">
                    <div className="font-mono text-xl font-bold text-pb-emerald">4.9★</div>
                    <div className="text-[10px] uppercase tracking-wider text-pb-silver-3">Verified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 lg:px-6 lg:py-12" id="products">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-pb-gold" />
              <h2 className="text-xl font-bold tracking-tight text-white lg:text-2xl">
                Verified Catalog
              </h2>
            </div>
            <p className="mt-1 text-sm text-pb-silver-3">
              {loading
                ? 'Loading catalog...'
                : `${products.length} verified products · Every displayed price includes the PlayBeat inventory markup`}
            </p>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-pb-line bg-pb-charcoal px-3 py-2 text-xs text-pb-silver outline-none"
            >
              <option value="all">All Categories</option>
              {categories.sort().map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid h-64 place-items-center text-sm text-pb-silver-3">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="grid h-64 place-items-center text-sm text-pb-silver-3">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => {
              const meta = CATEGORY_META[p.category || ''] || { icon: Tag, accent: 'text-pb-silver', bg: 'bg-pb-charcoal-2' }
              const Icon = meta.icon
              const showOriginal = p.originalCurrency && p.originalCurrency !== 'USD'
              const isWished = wishlist.has(p.id)
              return (
                <article
                  key={p.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-pb-line bg-pb-charcoal transition hover:border-pb-gold/30 hover:pb-shadow-lg"
                >
                  {/* Image / placeholder */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-pb-charcoal-2">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-pb-charcoal-2 to-pb-charcoal">
                        <div className={cn('grid h-16 w-16 place-items-center rounded-2xl', meta.bg)}>
                          <Icon className={cn('h-7 w-7', meta.accent)} />
                        </div>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-pb-ink via-transparent to-transparent opacity-60" />

                    {/* Instant Key badge */}
                    {p.digital && (
                      <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-pb-emerald/15 px-2 py-0.5 text-[10px] font-bold text-pb-emerald backdrop-blur-md">
                        <Zap className="h-2.5 w-2.5" />
                        Instant Key
                      </span>
                    )}

                    {/* Wishlist */}
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      aria-label={`Wishlist ${p.name}`}
                      className={cn(
                        'absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-lg border backdrop-blur-md transition',
                        isWished
                          ? 'border-pb-red/40 bg-pb-red/20 text-pb-red'
                          : 'border-white/10 bg-black/60 text-pb-silver-2 hover:text-white hover:bg-black/80'
                      )}
                    >
                      <Heart className={cn('h-3.5 w-3.5', isWished && 'fill-current')} />
                    </button>

                    {/* Region badge */}
                    {p.region && (
                      <span className="absolute bottom-2.5 right-2.5 z-10 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-pb-gold backdrop-blur-md">
                        {p.region}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-3.5">
                    {/* Category row */}
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <div className={cn('flex items-center gap-1', meta.accent)}>
                        <Icon className="h-2.5 w-2.5" />
                        <span className="uppercase tracking-wider">{p.category || 'Digital'}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-pb-silver-4">
                        <Star className="h-2.5 w-2.5 fill-pb-gold text-pb-gold" />
                        <span className="text-pb-silver-3">4.8</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-white"
                      title={p.name}
                    >
                      {p.name}
                    </h3>

                    {/* SKU + stock */}
                    <div className="mt-1 flex items-center justify-between text-[11px] text-pb-silver-3">
                      <span className="font-mono">{p.sku}</span>
                      <span className={cn(
                        'inline-flex items-center gap-1',
                        p.stock > 0 ? 'text-pb-emerald' : 'text-pb-red'
                      )}>
                        <span className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          p.stock > 0 ? 'bg-pb-emerald' : 'bg-pb-red'
                        )} />
                        {p.stock > 0 ? 'In stock' : 'Sold out'}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <div className="font-mono text-lg font-bold text-white">
                          {formatPrice(p.price, currency)}
                        </div>
                        {showOriginal && (
                          <div className="mt-0.5 text-[10px] text-pb-silver-4">
                            Source: {p.originalCurrency} {p.originalPrice?.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Add to cart */}
                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stock <= 0}
                      className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-pb-gradient-gold py-2 text-xs font-bold text-pb-ink shadow-lg shadow-pb-gold/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add to Cart
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Trust badges */}
      <section className="border-t border-pb-line bg-pb-ink/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 lg:grid-cols-4 lg:px-6">
          {[
            { icon: Zap, title: 'Instant Delivery', desc: 'Automated 24/7 key dispatch', color: 'text-pb-gold' },
            { icon: Shield, title: 'Buyer Protection', desc: 'Verified authentic products', color: 'text-pb-emerald' },
            { icon: Headphones, title: '24/7 Concierge', desc: 'WhatsApp & Telegram support', color: 'text-pb-blue' },
            { icon: Crown, title: 'PlayBeat Verified', desc: '35% inventory markup policy', color: 'text-pb-gold' },
          ].map((t) => {
            const Icon = t.icon
            return (
              <div key={t.title} className="flex items-center gap-3">
                <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pb-charcoal-2', t.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.title}</div>
                  <div className="text-[11px] text-pb-silver-3">{t.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pb-line bg-pb-ink">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
                  <img src="/playbeat-logo.png" alt="PlayBeat" className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-base font-extrabold text-white">PlayBeat</span>
                    <span className="rounded bg-pb-gold/20 px-1 text-[10px] font-bold text-pb-gold">2</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-pb-silver-3">
                    Digital Marketplace
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-pb-silver-3">
                Premium digital marketplace for instant keys, verified subscriptions, IPTV access
                and 4K Smart Projectors. 24/7 automated delivery with buyer protection.
              </p>
            </div>

            {/* Legal */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-pb-silver">Legal</div>
              <ul className="mt-3 space-y-2 text-xs text-pb-silver-3">
                <li><Link href="/legal/privacy" className="transition hover:text-pb-gold">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="transition hover:text-pb-gold">Terms &amp; Conditions</Link></li>
                <li><Link href="/legal/refund" className="transition hover:text-pb-gold">Return &amp; Refund Policy</Link></li>
                <li><Link href="/legal/shipping" className="transition hover:text-pb-gold">Shipping &amp; Delivery</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-pb-silver">Support</div>
              <ul className="mt-3 space-y-2 text-xs text-pb-silver-3">
                <li><Link href="/contact" className="transition hover:text-pb-gold">Contact Us</Link></li>
                <li><a href="https://wa.me/923341079333" target="_blank" rel="noopener noreferrer" className="transition hover:text-pb-gold">WhatsApp Concierge</a></li>
                <li><a href="https://t.me/playbeatdigital" target="_blank" rel="noopener noreferrer" className="transition hover:text-pb-gold">Telegram Support</a></li>
                <li><a href="mailto:playbeatdigital@proton.me" className="transition hover:text-pb-gold">playbeatdigital@proton.me</a></li>
              </ul>
            </div>

            {/* Address */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-pb-silver">Address</div>
              <p className="mt-3 text-xs leading-relaxed text-pb-silver-3">
                House 334, Street 06, Jinnahabad<br />
                Abbottabad, Khyber Pakhtunkhwa<br />
                Pakistan · Postal Code: 22010
              </p>
              <p className="mt-2 text-xs text-pb-silver-3">
                <span className="text-pb-silver-2">Mobile:</span> 0331-8333368<br />
                <span className="text-pb-silver-2">Landline:</span> 0992-338830
              </p>
            </div>
          </div>

          {/* Bottom row */}
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-pb-line pt-6 text-xs text-pb-silver-4 sm:flex-row">
            <div>
              <span className="font-semibold text-pb-silver-2">PlayBeat Digital Pvt Ltd</span> © 2026 · All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="rounded bg-pb-emerald/10 px-1.5 py-0.5 font-semibold text-pb-emerald">SSL SECURED</span>
              <span className="rounded bg-pb-blue/10 px-1.5 py-0.5 font-semibold text-pb-blue">VERIFIED</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        cart={cart}
        currency={currency}
        totalUSD={cartTotalUSD}
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
        totalUSD={cartTotalUSD}
        currency={currency}
        submitting={submitting}
        onCheckout={handleCheckout}
      />

      {/* Confirmation dialog */}
      <Dialog open={!!confirmation} onOpenChange={(v) => !v && setConfirmation(null)}>
        <DialogContent className="border-pb-emerald/30 bg-pb-charcoal/95 text-white backdrop-blur-xl">
          <DialogHeader>
            <div className="mb-2 grid h-14 w-14 place-items-center rounded-full bg-pb-emerald/15">
              <CheckCircle2 className="h-7 w-7 text-pb-emerald" />
            </div>
            <DialogTitle className="text-xl font-bold">Order Placed!</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-pb-silver-2">
            Your order has been received and is now pending. You&apos;ll receive your digital
            products via email shortly.
          </p>
          <div className="mt-4 rounded-xl border border-pb-line bg-pb-charcoal-2 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-pb-silver-3">Order Number</span>
              <span className="font-mono font-bold text-pb-gold">{confirmation?.orderNumber}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-pb-silver-3">Total (USD)</span>
              <span className="font-mono font-bold text-white">$ {confirmation?.total.toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setConfirmation(null)}
              className="bg-pb-gradient-gold text-pb-ink hover:brightness-105"
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
  currency,
  totalUSD,
  onUpdateQty,
  onRemove,
  onCheckout,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  cart: CartItem[]
  currency: CurrencyCode
  totalUSD: number
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
          'absolute inset-0 bg-black/70 backdrop-blur-sm transition',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => onOpenChange(false)}
      />
      <aside
        className={cn(
          'absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-pb-line bg-pb-ink transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-pb-line p-4">
          <h3 className="flex items-center gap-2 text-base font-bold text-white">
            <ShoppingCart className="h-5 w-5 text-pb-gold" />
            Your Cart ({cart.length})
          </h3>
          <button
            onClick={() => onOpenChange(false)}
            className="grid h-8 w-8 place-items-center rounded-lg text-pb-silver-3 transition hover:bg-pb-charcoal-2 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="grid h-40 place-items-center text-center text-sm text-pb-silver-3">
              <div>
                <ShoppingCart className="mx-auto h-10 w-10 text-pb-silver-4" />
                <p className="mt-2">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-pb-line bg-pb-charcoal p-3"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-pb-charcoal-2 text-[10px] font-mono font-bold text-pb-silver-3">
                    {c.sku.slice(0, 6)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-xs font-medium text-white" title={c.name}>
                      {c.name}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-pb-gold">
                      {formatPrice(c.price, currency)} × {c.qty}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateQty(c.id, -1)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-pb-line bg-pb-charcoal-2 text-pb-silver-2 transition hover:bg-pb-charcoal-3"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-mono text-white">{c.qty}</span>
                    <button
                      onClick={() => onUpdateQty(c.id, 1)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-pb-line bg-pb-charcoal-2 text-pb-silver-2 transition hover:bg-pb-charcoal-3"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => onRemove(c.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-pb-red/70 transition hover:bg-pb-red/10 hover:text-pb-red"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-pb-line p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-pb-silver-3">Total ({currency})</span>
              <span className="font-mono text-xl font-bold text-white">
                {formatPrice(totalUSD, currency)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-pb-gradient-gold py-3 text-sm font-bold text-pb-ink shadow-lg shadow-pb-gold/25 transition hover:brightness-105"
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
  totalUSD,
  currency,
  submitting,
  onCheckout,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  totalUSD: number
  currency: CurrencyCode
  submitting: boolean
  onCheckout: (name: string, email: string) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-pb-line bg-pb-charcoal/95 text-white backdrop-blur-xl">
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
            <label className="text-xs font-medium text-pb-silver-3">Full Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-xl border border-pb-line bg-pb-charcoal-2 px-3 py-2.5 text-sm text-white placeholder:text-pb-silver-4 outline-none transition focus:border-pb-gold/40"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-pb-silver-3">Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-pb-line bg-pb-charcoal-2 px-3 py-2.5 text-sm text-white placeholder:text-pb-silver-4 outline-none transition focus:border-pb-gold/40"
            />
            <p className="text-[11px] text-pb-silver-4">
              We&apos;ll send your digital products to this email.
            </p>
          </div>
          <div className="rounded-xl border border-pb-line bg-pb-charcoal-2 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-pb-silver-3">Total ({currency})</span>
              <span className="font-mono text-lg font-bold text-white">
                {formatPrice(totalUSD, currency)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-pb-silver-4">
              <span>USD equivalent:</span>
              <span className="font-mono">$ {totalUSD.toFixed(2)}</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-pb-silver-2 hover:bg-pb-charcoal-2 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="gap-2 bg-pb-gradient-gold text-pb-ink hover:brightness-105"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Place Order · {formatPrice(totalUSD, currency)}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

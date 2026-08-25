'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  Truck,
  ArrowRight,
  ChevronDown,
  Flame,
  Crown,
  Star,
  Sparkles,
  TrendingUp,
  Tag,
  Gift,
  Cpu,
  Package,
  Tv,
  Layers,
  ArrowUpRight,
  Globe,
  Clock,
  ChevronRight,
  KeyRound,
  Settings,
  User,
  Menu,
  Heart,
  Bell,
  ArrowLeft,
  RotateCcw,
  type LucideIcon,
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
import { ProductCard } from './product-card'
import { QuickViewModal } from './quick-view-modal'
import { CustomerAuthModal } from './customer-auth-modal'
import { useCustomer } from '@/lib/use-customer'

// StoreProduct re-exported from ProductCard
export interface StoreProduct {
  id: string
  sku: string
  name: string
  description?: string | null
  category?: string | null
  brand?: string | null
  price: number
  currency: string
  originalPrice?: number | null
  originalCurrency?: string | null
  compareAtPrice?: number | null
  region?: string | null
  stock: number
  status: string
  image?: string | null
  images?: string[]
  digital: boolean
  deliveryMethod?: string | null
  tags: string[]
  rating?: number
  reviewCount?: number
  salesCount?: number
  featured?: boolean
  trending?: boolean
  bestSeller?: boolean
  flashDeal?: boolean
}

interface CartItem extends StoreProduct {
  qty: number
}

const CART_STORAGE_KEY = 'pb_cart_v2'
const CURRENCY_STORAGE_KEY = 'pb_currency'

// Category bar navigation — matches the spec
const CATEGORY_BAR = [
  { label: 'Gaming', icon: Cpu, filter: 'Games' },
  { label: 'Software', icon: Package, filter: 'Software' },
  { label: 'AI Tools', icon: Sparkles, filter: 'AI Tools' },
  { label: 'IPTV', icon: Tv, filter: 'IPTV' },
  { label: 'Streaming', icon: Play, filter: 'Streaming' },
  { label: 'Gift Cards', icon: Gift, filter: 'Gift Cards' },
  { label: 'Digital Licenses', icon: KeyRound, filter: 'Digital Licenses' },
  { label: 'Set-Top Boxes', icon: Tv, filter: 'Set-Top Boxes' },
  { label: 'Smart Projectors', icon: Tv, filter: 'Smart Projectors' },
  { label: 'Add-ons', icon: Layers, filter: 'Add-ons' },
  { label: 'Services', icon: Settings, filter: 'Services' },
  { label: 'Trending', icon: TrendingUp, filter: 'trending' },
  { label: '⚡ Flash Deals', icon: Zap, filter: 'flashDeal' },
]

// Featured categories for the grid
const FEATURED_CATEGORIES = [
  { name: 'IPTV Subscriptions', desc: 'Live channels, sports and VOD', icon: Tv, accent: 'from-red-500 to-orange-600', image: '/assets/images/playbeat/category-subscriptions.png' },
  { name: 'Digital Licenses', desc: 'Windows, productivity & creative software', icon: KeyRound, accent: 'from-blue-500 to-cyan-600', image: '/assets/images/playbeat/category-software.png' },
  { name: 'Streaming Subscriptions', desc: 'Entertainment and streaming services', icon: Play, accent: 'from-red-600 to-rose-700', image: '/assets/images/playbeat/category-giftcards.png' },
  { name: 'Gaming', desc: 'Game keys, gaming products & digital access', icon: Cpu, accent: 'from-violet-500 to-purple-700', image: '/assets/images/playbeat/category-games.png' },
  { name: 'AI Tools', desc: 'AI productivity and creator tools', icon: Sparkles, accent: 'from-blue-500 to-indigo-700', image: '/assets/images/playbeat/category-ai.png' },
  { name: 'Gift Cards', desc: 'Gaming, entertainment & platform gift cards', icon: Gift, accent: 'from-yellow-400 to-amber-600', image: '/assets/images/playbeat/category-giftcards.png' },
  { name: 'Set-Top Boxes', desc: 'Smart streaming hardware', icon: Tv, accent: 'from-slate-500 to-slate-700', image: '/assets/images/playbeat/category-free-tools.png' },
  { name: 'Smart Projectors', desc: '4K entertainment & home cinema hardware', icon: Tv, accent: 'from-cyan-500 to-blue-700', image: '/assets/images/playbeat/category-projectors.png' },
  { name: 'Add-ons', desc: 'Sports and premium VOD extensions', icon: Layers, accent: 'from-emerald-500 to-teal-700', image: '/assets/images/playbeat/category-bundles.png' },
]

// FAQ items
const FAQ_ITEMS = [
  { q: 'How does digital delivery work?', a: 'After successful payment, digital products (software keys, subscriptions, gift cards) are automatically delivered to your email and PlayBeat account dashboard. Most orders are processed within minutes.' },
  { q: 'How long does delivery take?', a: 'Digital products are delivered instantly (24/7 automated delivery). Physical hardware like smart projectors and set-top boxes ship within 1-3 business days with tracked express shipping.' },
  { q: 'How does activation work?', a: 'Each digital product comes with detailed activation instructions. For software licenses, you\'ll receive a product key and step-by-step guide. For subscriptions, you\'ll receive account credentials or activation links.' },
  { q: 'What payment methods do you accept?', a: 'We accept major credit/debit cards, PayPal, bank transfers, and cryptocurrency. All payments are processed through secure, encrypted payment gateways.' },
  { q: 'What is your refund policy?', a: 'We offer refunds for undelivered products, materially different items, or technical issues we cannot resolve. Please see our Refund Policy page for full details.' },
  { q: 'How are products verified?', a: 'Every product in our catalog is reviewed before listing. We verify authenticity, test activation, and ensure all keys and accounts are genuine and functional.' },
  { q: 'How does IPTV delivery work?', a: 'IPTV subscriptions are delivered with M3U playlist URLs, portal credentials, or app activation codes. You\'ll receive setup instructions for your preferred device (Smart TV, Android box, Fire Stick, etc.).' },
  { q: 'How is hardware shipped?', a: 'Smart projectors and set-top boxes are shipped via express courier with full tracking. Shipping times vary by location: 1-3 days domestically, 5-10 days internationally.' },
  { q: 'Is there a warranty on hardware?', a: 'Yes, all hardware products come with manufacturer warranty (typically 12 months). Extended warranty options may be available for select products.' },
  { q: 'How can I contact customer support?', a: 'Our support team is available 24/7 via WhatsApp, Telegram, and email. Visit our Contact page for all available channels. Typical response time is under 30 minutes.' },
]

// Trust strip items
const TRUST_ITEMS = [
  { icon: Zap, title: 'Instant Delivery', desc: 'Digital products delivered automatically', color: 'text-blue-400' },
  { icon: CheckCircle2, title: 'Verified Products', desc: 'Products reviewed before listing', color: 'text-emerald-400' },
  { icon: Shield, title: 'Secure Checkout', desc: 'Protected payment processing', color: 'text-violet-400' },
  { icon: Headphones, title: '24/7 Support', desc: 'Fast customer assistance', color: 'text-cyan-400' },
  { icon: Truck, title: 'Tracked Shipping', desc: 'For physical hardware orders', color: 'text-orange-400' },
]

// Why PlayBeat cards
const WHY_CARDS = [
  { icon: Zap, title: 'Instant Delivery', desc: 'Automated 24/7 digital product dispatch', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: CheckCircle2, title: 'Verified Digital Products', desc: 'Every product reviewed and tested', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: Shield, title: 'Secure Payments', desc: 'SSL-encrypted checkout processing', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Crown, title: 'Buyer Protection', desc: 'Satisfaction guarantee on all orders', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { icon: Headphones, title: '24/7 Support', desc: 'WhatsApp & Telegram concierge', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Globe, title: 'Global Availability', desc: 'Serving 200+ countries worldwide', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { icon: Truck, title: 'Express Hardware Shipping', desc: 'Tracked delivery for physical products', color: 'text-red-400', bg: 'bg-red-500/10' },
]

function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

export function Storefront() {
  const router = useRouter()
  const { customer, loading: customerLoading } = useCustomer()

  const [products, setProducts] = useState<StoreProduct[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'featured' | 'best-selling' | 'rating' | 'newest' | 'price-low' | 'price-high' | 'discount'>('featured')
  const [trendingFilter, setTrendingFilter] = useState<string>('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<{ orderNumber: string; total: number } | null>(null)
  const [currency, setCurrency] = useState<CurrencyCode>('PKR')
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [quickView, setQuickView] = useState<StoreProduct | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)
  const searchRef = useRef<HTMLInputElement>(null)

  // Load preferences
  useEffect(() => {
    try {
      const savedCur = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null
      if (savedCur && SUPPORTED_CURRENCIES.includes(savedCur)) setCurrency(savedCur)
      const wish = localStorage.getItem('pb_wishlist')
      if (wish) setWishlist(new Set(JSON.parse(wish)))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency)
  }, [currency])

  useEffect(() => {
    localStorage.setItem('pb_wishlist', JSON.stringify([...wishlist]))
  }, [wishlist])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/storefront/products')
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
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY)
      if (raw) setCart(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  const cartTotalUSD = cart.reduce((s, c) => s + c.price * c.qty, 0)
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  // Filtered products
  const flashDeals = products.filter(p => p.flashDeal)
  const trendingProducts = products.filter(p => p.trending)
  const hardwareProducts = products.filter(p => !p.digital)
  const featuredProducts = products.filter(p => p.featured).slice(0, 8)

  // Trending filter + sort
  const filteredTrending = useMemo(() => {
    let result = [...trendingProducts]
    if (trendingFilter !== 'all') {
      result = result.filter(p => {
        const cat = (p.category || '').toLowerCase()
        if (trendingFilter === 'digital') return p.digital
        if (trendingFilter === 'hardware') return !p.digital
        if (trendingFilter === 'gaming') return cat.includes('game') || cat.includes('gift')
        if (trendingFilter === 'iptv') return cat.includes('iptv')
        if (trendingFilter === 'software') return cat.includes('software') || cat.includes('email')
        if (trendingFilter === 'streaming') return cat.includes('streaming')
        if (trendingFilter === 'ai') return cat.includes('ai')
        return true
      })
    }
    // Sort
    if (sortBy === 'best-selling') result.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    else if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    else if (sortBy === 'newest') result.sort((a, b) => b.sku.localeCompare(a.sku))
    else if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price)
    else if (sortBy === 'discount') {
      result.sort((a, b) => {
        const da = a.compareAtPrice ? (a.compareAtPrice - a.price) / a.compareAtPrice : 0
        const db = b.compareAtPrice ? (b.compareAtPrice - b.price) / b.compareAtPrice : 0
        return db - da
      })
    }
    return result
  }, [trendingProducts, trendingFilter, sortBy])

  // Search suggestions
  const searchSuggestions = search.length > 1
    ? products
        .filter(p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()) ||
          (p.category || '').toLowerCase().includes(search.toLowerCase()) ||
          (p.tags || []).some(t => t.includes(search.toLowerCase()))
        )
        .slice(0, 6)
    : []

  function addToCart(p: StoreProduct) {
    setCart(prev => {
      const existing = prev.find(c => c.id === p.id)
      if (existing) {
        return prev.map(c => c.id === p.id ? { ...c, qty: Math.min(c.qty + 1, p.stock) } : c)
      }
      return [...prev, { ...p, qty: 1 }]
    })
    toast.success(`${p.name.slice(0, 40)}${p.name.length > 40 ? '...' : ''} added to cart`)
  }

  function buyNow(p: StoreProduct) {
    addToCart(p)
    setCartOpen(true)
  }

  function toggleWishlist(p: StoreProduct) {
    setWishlist(prev => {
      const next = new Set(prev)
      if (next.has(p.id)) {
        next.delete(p.id)
        toast.info('Removed from wishlist')
      } else {
        next.add(p.id)
        // Also sync to server if logged in
        if (customer) {
          fetch('/api/customer/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ productId: p.id, action: 'toggle' }),
          }).catch(() => {})
        }
        toast.success('Added to wishlist')
      }
      return next
    })
  }

  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(c => {
      if (c.id !== id) return c
      return { ...c, qty: Math.max(0, Math.min(c.qty + delta, c.stock)) }
    }).filter(c => c.qty > 0))
  }

  function removeItem(id: string) {
    setCart(prev => prev.filter(c => c.id !== id))
  }

  async function handleCheckout(name: string, email: string) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/storefront/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email || (customer?.email || null),
          items: cart.map(c => ({ productId: c.id, qty: c.qty })),
          paymentMethod: 'Card',
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Checkout failed')
      setConfirmation(data.data)
      setCart([])
      setCheckoutOpen(false)
      toast.success('Order placed successfully!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Checkout failed')
    } finally {
      setSubmitting(false)
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/?search=${encodeURIComponent(search)}`)
      // Filter products client-side
      setSearchFocused(false)
    }
  }

  function handleCategoryClick(filter: string) {
    if (filter === 'trending') {
      document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' })
    } else if (filter === 'flashDeal') {
      document.getElementById('flash-deals')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      setActiveCategory(filter)
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#050608] text-slate-200">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ===== ANNOUNCEMENT BAR ===== */}
      <div className="relative z-30 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-[11px] font-medium lg:text-xs">
          <Flame className="h-3 w-3 shrink-0 animate-pulse-soft" />
          <span>
            <span className="font-bold">FLASH SALE</span> — Get 15% OFF with code{' '}
            <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono font-bold">PLAYBEAT15</span> · Instant 24/7 Automated Delivery
          </span>
        </div>
      </div>

      {/* ===== PRIMARY NAVBAR ===== */}
      <header className={cn(
        'sticky top-0 z-30 border-b transition-all duration-300',
        scrolled ? 'border-white/10 bg-[#050608]/95 backdrop-blur-xl shadow-lg shadow-black/30' : 'border-transparent bg-[#050608]/80 backdrop-blur-md'
      )}>
        <div className={cn('mx-auto flex max-w-7xl items-center gap-4 px-4 transition-all lg:px-6', scrolled ? 'h-14' : 'h-16')}>
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-3 transition hover:opacity-90">
            <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-white shadow-lg shadow-blue-500/20">
              <img src="/playbeat-logo.png" alt="PlayBeat" className="h-7 w-7 object-contain" />
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="flex items-center gap-1">
                <span className="text-sm font-extrabold tracking-tight text-white">PlayBeat</span>
                <span className="rounded bg-blue-500/20 px-1 text-[9px] font-bold text-blue-400">2</span>
              </div>
              <div className="text-[8px] uppercase tracking-[0.2em] text-slate-500">Digital Marketplace</div>
            </div>
          </Link>

          {/* Search bar */}
          <div className="relative hidden flex-1 max-w-xl md:block">
            <Search className={cn('pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 transition', searchFocused ? 'text-blue-400' : 'text-slate-500')} />
            <form onSubmit={handleSearchSubmit}>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Search games, software, IPTV, subscriptions, AI tools, projectors..."
                className={cn(
                  'w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition',
                  searchFocused ? 'border-blue-500/40 bg-white/[0.08] shadow-lg shadow-blue-500/10' : 'border-white/10 bg-white/5'
                )}
              />
            </form>
            {/* Search suggestions */}
            {searchFocused && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-[#0a0e1a]/95 shadow-2xl backdrop-blur-xl scrollbar-thin">
                <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Products</div>
                {searchSuggestions.map(p => (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className="flex items-center gap-3 px-3 py-2 transition hover:bg-white/5"
                    onClick={() => { setSearch(''); setSearchFocused(false) }}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/5">
                      {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-contain" /> : <Package className="h-5 w-5 text-slate-500" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.category} · {p.sku}</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-blue-400">{formatPrice(p.price, currency)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Currency selector */}
            <div className="relative">
              <button
                onClick={() => setCurrencyOpen(v => !v)}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
              >
                <span className="text-blue-400">{currency}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
              {currencyOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCurrencyOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#0a0e1a] py-1 shadow-2xl">
                    {SUPPORTED_CURRENCIES.map(c => (
                      <button
                        key={c}
                        onClick={() => { setCurrency(c); setCurrencyOpen(false); toast.success(`Currency: ${c}`) }}
                        className={cn('flex w-full items-center justify-between px-3 py-2 text-xs transition hover:bg-white/5', currency === c ? 'text-blue-400' : 'text-slate-300')}
                      >
                        {CURRENCY_LABELS[c]}
                        {currency === c && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Wishlist */}
            <Link href="/account/wishlist" className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/5 hover:text-white">
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.size > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {wishlist.size}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {customerLoading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
            ) : customer ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition hover:bg-white/5"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden text-sm font-medium text-white sm:inline">{customer.name.split(' ')[0]}</span>
                  <ChevronDown className={cn('hidden h-3 w-3 text-slate-400 transition sm:block', profileOpen && 'rotate-180')} />
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0a0e1a]/95 shadow-2xl backdrop-blur-xl">
                      <div className="border-b border-white/5 p-3">
                        <div className="text-sm font-semibold text-white">{customer.name}</div>
                        <div className="truncate text-[11px] text-slate-400">{customer.email}</div>
                      </div>
                      <div className="py-1">
                        {[
                          { label: 'My Account', href: '/account', icon: User },
                          { label: 'Orders', href: '/account/orders', icon: Package },
                          { label: 'Digital Licenses', href: '/account/licenses', icon: KeyRound },
                          { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
                          { label: 'Support', href: '/contact', icon: Headphones },
                        ].map(item => (
                          <Link key={item.href} href={item.href} className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5" onClick={() => setProfileOpen(false)}>
                            <item.icon className="h-3.5 w-3.5 text-slate-400" /> {item.label}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-white/5 py-1">
                        <button
                          onClick={() => { setProfileOpen(false); window.location.href = '/api/customer/logout' }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/5"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setAuthOpen(true)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/5">Login</button>
                <button onClick={() => setAuthOpen(true)} className="rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110">Sign Up</button>
              </div>
            )}

            {/* Mobile menu */}
            <button onClick={() => setMobileMenuOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/5 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ===== SECONDARY CATEGORY BAR ===== */}
        <div className="border-t border-white/5 bg-[#030406]/60">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 scrollbar-thin lg:px-6">
            {CATEGORY_BAR.map(cat => (
              <button
                key={cat.label}
                onClick={() => handleCategoryClick(cat.filter)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  activeCategory === cat.filter ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden border-b border-white/5">
        {/* Animated background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl animate-pulse-soft" />
          <div className="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            {/* Left: headline */}
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
                Verified Digital Marketplace · Instant Key Dispatch
              </div>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Premium Digital Access.
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-orange-300 bg-clip-text text-transparent">
                  Beautifully Delivered.
                </span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400 lg:text-lg">
                Instant digital licenses, gaming products, streaming subscriptions, IPTV and flagship
                entertainment hardware — backed by fast delivery and trusted support.
              </p>

              {/* Hero search */}
              <form onSubmit={handleSearchSubmit} className="mt-7">
                <div className="relative max-w-lg">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="What are you looking for today?"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-32 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500/40 focus:bg-white/[0.08]"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href="#products" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#categories" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-medium text-slate-200 transition hover:bg-white/10">
                  Explore Categories
                </a>
              </div>

              {/* Social proof */}
              <div className="mt-8 flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['from-blue-500 to-blue-700', 'from-violet-500 to-violet-700', 'from-emerald-500 to-emerald-700', 'from-orange-400 to-amber-600'].map((g, i) => (
                      <div key={i} className={cn('grid h-7 w-7 place-items-center rounded-full border-2 border-[#050608] bg-gradient-to-br text-[10px] font-bold text-white', g)}>
                        {['P', 'D', 'A', 'S'][i]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-semibold text-white">12,000+ customers</div>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                      <span className="ml-1 text-slate-500">4.9/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: hero image */}
            <div className="relative hidden lg:block">
              <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-blue-500/10">
                <img src="/assets/images/playbeat/hero-marketplace.png" alt="PlayBeat Digital Marketplace" className="h-full w-full object-cover" />
              </div>
              {/* Floating cards */}
              <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-white/10 bg-[#0a0e1a]/90 p-3 backdrop-blur-md xl:block">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/15">
                    <Zap className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Instant Delivery</div>
                    <div className="text-[10px] text-slate-400">24/7 automated</div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 hidden rounded-xl border border-white/10 bg-[#0a0e1a]/90 p-3 backdrop-blur-md xl:block">
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-500/15">
                    <Shield className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Buyer Protection</div>
                    <div className="text-[10px] text-slate-400">100% secure</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== TRUST STRIP ===== */}
        <div className="relative border-t border-white/5 bg-[#030406]/60">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-5 sm:grid-cols-3 lg:grid-cols-5 lg:px-6">
            {TRUST_ITEMS.map(t => {
              const Icon = t.icon
              return (
                <div key={t.title} className="flex items-center gap-3">
                  <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5', t.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{t.title}</div>
                    <div className="text-[10px] text-slate-400">{t.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURED CATEGORIES ===== */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16" id="categories">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            <Layers className="h-3 w-3" /> Curated Collections
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">Featured Categories</h2>
          <p className="mt-2 text-sm text-slate-400">Explore our premium digital product collections</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
          {FEATURED_CATEGORIES.map(cat => {
            const Icon = cat.icon
            return (
              <button
                key={cat.name}
                onClick={() => {
                  // Map featured category to actual DB category
                  const map: Record<string, string> = {
                    'IPTV Subscriptions': 'IPTV',
                    'Digital Licenses': 'Software',
                    'Streaming Subscriptions': 'Streaming Accounts',
                    'Gaming': 'Gift Cards',
                    'AI Tools': 'AI & Productivity',
                    'Gift Cards': 'Gift Cards',
                    'Smart Projectors': 'Smart Projectors',
                    'Set-Top Boxes': 'Smart Projectors',
                    'Add-ons': 'IPTV',
                  }
                  setActiveCategory(map[cat.name] || 'all')
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-blue-500/30 hover:bg-white/[0.06]"
              >
                <div className={cn('mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br', cat.accent)}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                <p className="mt-0.5 text-[11px] text-slate-400">{cat.desc}</p>
                <ChevronRight className="absolute right-4 top-5 h-4 w-4 text-slate-600 transition group-hover:right-3 group-hover:text-blue-400" />
              </button>
            )
          })}
        </div>
      </section>

      {/* ===== FLASH DEALS ===== */}
      {flashDeals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 lg:px-6" id="flash-deals">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-400">
                <Zap className="h-3 w-3 animate-pulse-soft" /> FLASH DEALS
              </div>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white lg:text-3xl">Limited-Time Offers</h2>
            </div>
            <span className="text-sm text-slate-400">{flashDeals.length} deals active</span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {flashDeals.slice(0, 10).map(p => (
              <ProductCard
                key={p.id}
                product={p}
                currency={currency}
                onAddToCart={addToCart}
                onBuyNow={buyNow}
                onQuickView={setQuickView}
                onToggleWishlist={toggleWishlist}
                isInWishlist={wishlist.has(p.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ===== SMART 4K HARDWARE ===== */}
      {hardwareProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
              <Tv className="h-3 w-3" /> SMART 4K ENTERTAINMENT
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white lg:text-3xl">Flagship Hardware</h2>
            <p className="mt-1 text-sm text-slate-400">4K Smart Projectors & Set-Top Boxes — express tracked shipping</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hardwareProducts.slice(0, 6).map(p => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-5 transition hover:border-cyan-500/30"
              >
                <div className="flex items-center gap-4">
                  <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-contain p-2 transition group-hover:scale-105" loading="lazy" />
                    ) : (
                      <Tv className="h-10 w-10 text-cyan-400" />
                    )}
                    <span className="absolute left-1 top-1 rounded bg-cyan-500/20 px-1.5 py-0.5 text-[8px] font-bold text-cyan-300 backdrop-blur-md">4K</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-bold text-white">{p.name}</h3>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">{p.description}</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="font-mono text-lg font-bold text-white">{formatPrice(p.price, currency)}</span>
                      {p.compareAtPrice && (
                        <span className="font-mono text-xs text-slate-500 line-through">{formatPrice(p.compareAtPrice, currency)}</span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-cyan-400">
                      <Truck className="h-3 w-3" /> Express Shipping
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== TRENDING NOW ===== */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6" id="trending">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
            <Flame className="h-3 w-3" /> TRENDING NOW
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white lg:text-3xl">Trending Products</h2>
        </div>

        {/* Filters + Sort */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {['all', 'digital', 'gaming', 'iptv', 'software', 'streaming', 'ai', 'hardware'].map(f => (
              <button
                key={f}
                onClick={() => setTrendingFilter(f)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition',
                  trendingFilter === f ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none"
            >
              <option value="featured">Featured</option>
              <option value="best-selling">Best Selling</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid h-48 place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTrending.slice(0, 12).map(p => (
              <ProductCard
                key={p.id}
                product={p}
                currency={currency}
                onAddToCart={addToCart}
                onBuyNow={buyNow}
                onQuickView={setQuickView}
                onToggleWishlist={toggleWishlist}
                isInWishlist={wishlist.has(p.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ===== ALL PRODUCTS ===== */}
      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-6" id="products">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
              <Package className="h-3 w-3" /> Full Catalog
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
              {activeCategory === 'all' ? 'All Products' : activeCategory}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {activeCategory === 'all'
                ? `${products.length} verified products available`
                : `${products.filter(p => p.category === activeCategory).length} products in this category`}
            </p>
          </div>
          {activeCategory !== 'all' && (
            <button onClick={() => setActiveCategory('all')} className="text-xs font-medium text-blue-400 transition hover:text-blue-300">
              ← View All
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid h-48 place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {(activeCategory === 'all' ? products : products.filter(p => p.category === activeCategory)).slice(0, 20).map(p => (
              <ProductCard
                key={p.id}
                product={p}
                currency={currency}
                onAddToCart={addToCart}
                onBuyNow={buyNow}
                onQuickView={setQuickView}
                onToggleWishlist={toggleWishlist}
                isInWishlist={wishlist.has(p.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ===== WHY PLAYBEAT ===== */}
      <section className="border-y border-white/5 bg-[#030406]/60 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <Shield className="h-3 w-3" /> Trust & Reliability
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">Why PlayBeat Digital?</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CARDS.map(card => {
              const Icon = card.icon
              return (
                <div key={card.title} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-white/10 hover:bg-white/[0.06]">
                  <div className={cn('grid h-11 w-11 place-items-center rounded-xl', card.bg)}>
                    <Icon className={cn('h-5 w-5', card.color)} />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-white">{card.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">{card.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="mx-auto max-w-3xl px-4 py-12 lg:px-6 lg:py-16">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
            <Headphones className="h-3 w-3" /> Help Center
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((faq, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.03]">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-white/[0.05]"
              >
                <span className="text-sm font-medium text-white">{faq.q}</span>
                <ChevronDown className={cn('h-4 w-4 shrink-0 text-slate-400 transition', expandedFaq === i && 'rotate-180')} />
              </button>
              {expandedFaq === i && (
                <div className="px-4 pb-4 text-sm leading-relaxed text-slate-400">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 bg-[#030406]">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white">
                  <img src="/playbeat-logo.png" alt="PlayBeat" className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-base font-extrabold text-white">PlayBeat</span>
                    <span className="rounded bg-blue-500/20 px-1 text-[10px] font-bold text-blue-400">2</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Digital Marketplace</div>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400">
                Your gateway to worldwide digital subscriptions & products. Premium keys, verified accounts,
                4K Smart Projectors and 24/7 automated delivery with buyer protection.
              </p>
            </div>

            {/* Digital Catalog */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">Digital Catalog</div>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li><Link href="/?category=Gaming" className="transition hover:text-blue-400">Gaming</Link></li>
                <li><Link href="/?category=IPTV" className="transition hover:text-blue-400">IPTV</Link></li>
                <li><Link href="/?category=Software" className="transition hover:text-blue-400">Software</Link></li>
                <li><Link href="/?category=AI+Tools" className="transition hover:text-blue-400">AI Tools</Link></li>
                <li><Link href="/?category=Streaming" className="transition hover:text-blue-400">Streaming</Link></li>
                <li><Link href="/?category=Gift+Cards" className="transition hover:text-blue-400">Gift Cards</Link></li>
              </ul>
            </div>

            {/* Hardware */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">Hardware</div>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li><Link href="/?category=Smart+Projectors" className="transition hover:text-blue-400">Smart Projectors</Link></li>
                <li><Link href="/?category=Set-Top+Boxes" className="transition hover:text-blue-400">Set-Top Boxes</Link></li>
                <li><Link href="/?category=Add-ons" className="transition hover:text-blue-400">Accessories</Link></li>
              </ul>
            </div>

            {/* Customer */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">Customer</div>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li><Link href="/account" className="transition hover:text-blue-400">My Account</Link></li>
                <li><Link href="/account/orders" className="transition hover:text-blue-400">Orders</Link></li>
                <li><Link href="/account/wishlist" className="transition hover:text-blue-400">Wishlist</Link></li>
                <li><Link href="/contact" className="transition hover:text-blue-400">Support</Link></li>
                <li><a href="#faq" className="transition hover:text-blue-400">FAQ</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">Company</div>
              <ul className="mt-3 space-y-2 text-xs text-slate-400">
                <li><Link href="/contact" className="transition hover:text-blue-400">About</Link></li>
                <li><Link href="/contact" className="transition hover:text-blue-400">Contact</Link></li>
                <li><Link href="/legal/privacy" className="transition hover:text-blue-400">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="transition hover:text-blue-400">Terms</Link></li>
                <li><Link href="/legal/refund" className="transition hover:text-blue-400">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Support channels */}
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/5 pt-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Support:</span>
            <a href="https://wa.me/923341079333" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/10">WhatsApp</a>
            <a href="https://t.me/playbeatdigital" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-xs font-medium text-blue-400 transition hover:bg-blue-500/10">Telegram</a>
            <a href="mailto:playbeatdigital@proton.me" className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-1.5 text-xs font-medium text-violet-400 transition hover:bg-violet-500/10">Email</a>
          </div>

          {/* Bottom */}
          <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-slate-500 sm:flex-row">
            <div>
              <span className="font-semibold text-slate-300">PlayBeat Digital Pvt Ltd</span> © 2026 · All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-emerald-400">SSL SECURED</span>
              <span className="rounded bg-blue-500/10 px-1.5 py-0.5 font-semibold text-blue-400">VERIFIED</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== CART DRAWER ===== */}
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        cart={cart}
        currency={currency}
        totalUSD={cartTotalUSD}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }}
      />

      {/* ===== CHECKOUT DIALOG ===== */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        totalUSD={cartTotalUSD}
        currency={currency}
        submitting={submitting}
        onCheckout={handleCheckout}
        cart={cart}
      />

      {/* ===== QUICK VIEW MODAL ===== */}
      <QuickViewModal
        product={quickView}
        open={!!quickView}
        onOpenChange={(v) => !v && setQuickView(null)}
        currency={currency}
        onAddToCart={addToCart}
        onBuyNow={buyNow}
        onToggleWishlist={toggleWishlist}
        isInWishlist={quickView ? wishlist.has(quickView.id) : false}
      />

      {/* ===== AUTH MODAL ===== */}
      <CustomerAuthModal open={authOpen} onOpenChange={setAuthOpen} />

      {/* ===== MOBILE MENU ===== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-[#0a0e1a]">
            <div className="flex items-center justify-between border-b border-white/5 p-4">
              <div className="flex items-center gap-2">
                <img src="/playbeat-logo.png" alt="PlayBeat" className="h-7 w-auto" />
                <span className="text-sm font-bold text-white">PlayBeat</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="scrollbar-thin flex-1 overflow-y-auto p-3">
              {CATEGORY_BAR.map(cat => (
                <button
                  key={cat.label}
                  onClick={() => { handleCategoryClick(cat.filter); setMobileMenuOpen(false) }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  <cat.icon className="h-4 w-4" /> {cat.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ===== CONFIRMATION DIALOG ===== */}
      <Dialog open={!!confirmation} onOpenChange={(v) => !v && setConfirmation(null)}>
        <DialogContent className="border-emerald-500/30 bg-[#0f172a]/95 text-white backdrop-blur-xl">
          <DialogHeader>
            <div className="mb-2 grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </div>
            <DialogTitle className="text-xl font-bold">Order Placed!</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            Your order has been received. You&apos;ll receive your digital products via email shortly.
          </p>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Order Number</span>
              <span className="font-mono font-bold text-blue-400">{confirmation?.orderNumber}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-400">Total (USD)</span>
              <span className="font-mono font-bold text-white">$ {confirmation?.total.toLocaleString()}</span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setConfirmation(null)} className="bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:brightness-110">
              Continue Shopping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ===== Cart Drawer =====
function CartDrawer({ open, onOpenChange, cart, currency, totalUSD, onUpdateQty, onRemove, onCheckout }: {
  open: boolean; onOpenChange: (v: boolean) => void; cart: CartItem[]; currency: CurrencyCode
  totalUSD: number; onUpdateQty: (id: string, delta: number) => void; onRemove: (id: string) => void; onCheckout: () => void
}) {
  return (
    <div className={cn('fixed inset-0 z-50 transition', open ? 'pointer-events-auto' : 'pointer-events-none')}>
      <div className={cn('absolute inset-0 bg-black/70 backdrop-blur-sm transition', open ? 'opacity-100' : 'opacity-0')} onClick={() => onOpenChange(false)} />
      <aside className={cn('absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0a0e1a] transition-transform duration-300', open ? 'translate-x-0' : 'translate-x-full')}>
        <div className="flex items-center justify-between border-b border-white/5 p-4">
          <h3 className="flex items-center gap-2 text-base font-bold text-white">
            <ShoppingCart className="h-5 w-5 text-blue-400" /> Your Cart ({cart.length})
          </h3>
          <button onClick={() => onOpenChange(false)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white">
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
              {cart.map(c => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/5">
                    {c.image ? <img src={c.image} alt={c.name} className="h-full w-full object-contain" /> : <span className="text-[10px] font-mono font-bold text-slate-400">{c.sku.slice(0, 6)}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-xs font-medium text-white" title={c.name}>{c.name}</div>
                    <div className="mt-0.5 font-mono text-xs text-blue-400">{formatPrice(c.price, currency)} × {c.qty}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => onUpdateQty(c.id, -1)} className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-mono text-white">{c.qty}</span>
                    <button onClick={() => onUpdateQty(c.id, 1)} className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button onClick={() => onRemove(c.id)} className="grid h-8 w-8 place-items-center rounded-lg text-red-400/70 transition hover:bg-red-500/10 hover:text-red-400">
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
              <span className="text-slate-400">Total ({currency})</span>
              <span className="font-mono text-xl font-bold text-white">{formatPrice(totalUSD, currency)}</span>
            </div>
            <button onClick={onCheckout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

// ===== Checkout Dialog =====
function CheckoutDialog({ open, onOpenChange, totalUSD, currency, submitting, onCheckout, cart }: {
  open: boolean; onOpenChange: (v: boolean) => void; totalUSD: number; currency: CurrencyCode
  submitting: boolean; onCheckout: (name: string, email: string) => void; cart: CartItem[]
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const hasDigital = cart.some(c => c.digital)
  const hasHardware = cart.some(c => !c.digital)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto border-white/10 bg-[#0a0e1a]/95 text-white backdrop-blur-xl scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Checkout</DialogTitle>
        </DialogHeader>

        {/* Cart summary */}
        {cart.length > 0 && (
          <div className="mb-4 space-y-2 rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Order Summary</div>
            {cart.map(c => (
              <div key={c.id} className="flex items-center gap-2 text-xs">
                <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded bg-white/5">
                  {c.image ? <img src={c.image} alt="" className="h-full w-full object-contain" /> : <Package className="h-4 w-4 text-slate-500" />}
                </div>
                <span className="min-w-0 flex-1 truncate text-slate-300">{c.name}</span>
                <span className="font-mono text-slate-400">×{c.qty}</span>
                <span className="font-mono font-semibold text-white">{formatPrice(c.price * c.qty, currency)}</span>
              </div>
            ))}
            {/* Delivery indicators */}
            {hasDigital && (
              <div className="flex items-center gap-1.5 border-t border-white/5 pt-2 text-[10px] text-emerald-400">
                <Zap className="h-3 w-3" /> Instant Digital Delivery
              </div>
            )}
            {hasHardware && (
              <div className="flex items-center gap-1.5 text-[10px] text-cyan-400">
                <Truck className="h-3 w-3" /> Tracked Express Shipping
              </div>
            )}
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); onCheckout(name, email) }} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Full Name *</label>
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="John Doe"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500/40" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400">Email (optional)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500/40" />
            <p className="text-[11px] text-slate-500">We&apos;ll send your digital products to this email.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total ({currency})</span>
              <span className="font-mono text-lg font-bold text-white">{formatPrice(totalUSD, currency)}</span>
            </div>
          </div>
          {/* Secure checkout indicator */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
            <Shield className="h-3 w-3 text-emerald-400" /> Secure SSL Checkout
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-300 hover:bg-white/5 hover:text-white">Cancel</Button>
            <Button type="submit" disabled={submitting} className="gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:brightness-110">
              {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Processing...</>) : (<>Place Order · {formatPrice(totalUSD, currency)}</>)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Need to import useMemo — moved to top of file


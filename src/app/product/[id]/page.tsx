'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingCart,
  Heart,
  Star,
  Zap,
  Truck,
  Clock,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Shield,
  ChevronDown,
  Package,
  KeyRound,
  Loader2,
  Plus,
  Minus,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatPrice, type CurrencyCode } from '@/lib/currency'
import { ProductCard } from '@/components/storefront/product-card'
import { useCustomer } from '@/lib/use-customer'

interface Product {
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

const FAQ_TABS = [
  { id: 'description', label: 'Description' },
  { id: 'features', label: 'Features' },
  { id: 'whats-included', label: "What's Included" },
  { id: 'delivery', label: 'Delivery Information' },
  { id: 'compatibility', label: 'Compatibility' },
  { id: 'activation', label: 'Activation Instructions' },
  { id: 'faq', label: 'FAQ' },
  { id: 'reviews', label: 'Reviews' },
]

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { customer } = useCustomer()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [imgIndex, setImgIndex] = useState(0)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [wishlist, setWishlist] = useState(false)
  const [currency] = useState<CurrencyCode>('PKR')

  const productId = params.id as string

  const fetchProduct = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch from storefront products API and find by ID
      const res = await fetch('/api/storefront/products')
      const data = await res.json()
      if (data?.ok) {
        const found = (data.data as Product[]).find(p => p.id === productId)
        if (found) {
          setProduct(found)
          // Get related products (same category, different ID)
          const rel = (data.data as Product[])
            .filter(p => p.category === found.category && p.id !== found.id)
            .slice(0, 4)
          setRelated(rel)
        } else {
          toast.error('Product not found')
          router.push('/')
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [productId, router])

  useEffect(() => { fetchProduct() }, [fetchProduct])

  // Check wishlist
  useEffect(() => {
    try {
      const w = JSON.parse(localStorage.getItem('pb_wishlist') || '[]')
      setWishlist(w.includes(productId))
    } catch {}
  }, [productId])

  function addToCart() {
    if (!product) return
    try {
      const cart = JSON.parse(localStorage.getItem('pb_cart_v2') || '[]')
      const existing = cart.find((c: any) => c.id === product.id)
      if (existing) {
        existing.qty = Math.min(existing.qty + qty, product.stock)
      } else {
        cart.push({ ...product, qty })
      }
      localStorage.setItem('pb_cart_v2', JSON.stringify(cart))
      toast.success(`${product.name.slice(0, 40)} added to cart`)
      // Dispatch event for navbar to update count
      window.dispatchEvent(new Event('storage'))
    } catch {}
  }

  function buyNow() {
    addToCart()
    setTimeout(() => router.push('/'), 500)
  }

  function toggleWishlist() {
    if (!product) return
    try {
      const w = JSON.parse(localStorage.getItem('pb_wishlist') || '[]')
      if (w.includes(product.id)) {
        const next = w.filter((id: string) => id !== product.id)
        localStorage.setItem('pb_wishlist', JSON.stringify(next))
        setWishlist(false)
        toast.info('Removed from wishlist')
      } else {
        w.push(product.id)
        localStorage.setItem('pb_wishlist', JSON.stringify(w))
        setWishlist(true)
        toast.success('Added to wishlist')
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#050608] text-slate-300">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    )
  }

  if (!product) return null

  const gallery = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : []
  const currentImage = gallery[imgIndex] || null

  const inStock = product.stock > 0
  const lowStock = inStock && product.stock <= 5
  const soldOut = !inStock

  const compareAt = product.compareAtPrice || product.originalPrice
  const hasDiscount = compareAt && compareAt > product.price
  const discountPct = hasDiscount ? Math.round(((compareAt - product.price) / compareAt) * 100) : 0
  const savings = hasDiscount ? compareAt - product.price : 0

  const deliveryMethod = product.deliveryMethod || (product.digital ? 'instant' : 'shipping')
  const DeliveryIcon = deliveryMethod === 'instant' ? Zap : deliveryMethod === 'shipping' ? Truck : Clock
  const deliveryText = deliveryMethod === 'instant' ? 'Instant Digital Delivery' : deliveryMethod === 'shipping' ? 'Express Shipping' : 'Manual Delivery'

  const rating = product.rating || 0
  const reviewCount = product.reviewCount || 0
  const salesCount = product.salesCount || 0

  return (
    <div className="min-h-screen bg-[#050608] text-slate-200">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-6 lg:px-6">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="transition hover:text-blue-400">Home</Link>
          <ChevronDown className="h-3 w-3 -rotate-90" />
          <span className="text-slate-400">{product.category || 'Products'}</span>
          <ChevronDown className="h-3 w-3 -rotate-90" />
          <span className="truncate text-slate-300">{product.name}</span>
        </nav>
      </div>

      {/* Product main */}
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Gallery */}
          <div>
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-950/50">
              {currentImage ? (
                <img src={currentImage} alt={product.name} className="h-full w-full object-contain p-6" />
              ) : (
                <div className="grid h-full w-full place-items-center text-slate-600">
                  <Package className="h-16 w-16" />
                </div>
              )}
              {/* Badges */}
              <div className="absolute left-4 top-4 flex flex-col gap-2">
                {product.bestSeller && (
                  <span className="rounded-md border border-yellow-400/30 bg-yellow-400/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400 backdrop-blur-md">BEST SELLER</span>
                )}
                {product.flashDeal && (
                  <span className="rounded-md border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400 backdrop-blur-md">FLASH DEAL</span>
                )}
                {product.featured && (
                  <span className="rounded-md border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 backdrop-blur-md">FEATURED</span>
                )}
              </div>
              {/* Discount */}
              {hasDiscount && (
                <div className="absolute right-4 top-4 rounded-lg bg-red-500 px-3 py-1 text-sm font-bold text-white shadow-lg shadow-red-500/30">-{discountPct}%</div>
              )}
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-thin">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={cn('h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition', i === imgIndex ? 'border-blue-500' : 'border-white/10 opacity-60 hover:opacity-100')}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">
            {/* Category */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold uppercase tracking-wider text-blue-400">{product.category || 'Digital'}</span>
              {product.region && (
                <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-slate-400">{product.region}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-white lg:text-3xl">{product.name}</h1>

            {/* Rating */}
            {rating > 0 && (
              <div className="mt-3 flex items-center gap-3 text-sm">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={cn('h-4 w-4', i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600')} />
                  ))}
                </div>
                <span className="font-medium text-white">{rating.toFixed(1)}</span>
                <span className="text-slate-500">({reviewCount} reviews)</span>
                {salesCount > 0 && (
                  <>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">{salesCount}+ sold</span>
                  </>
                )}
              </div>
            )}

            {/* Price */}
            <div className="mt-4 flex items-end gap-3">
              <div className="font-mono text-4xl font-bold text-white">{formatPrice(product.price, currency)}</div>
              {hasDiscount && (
                <div className="flex flex-col">
                  <span className="font-mono text-lg text-slate-500 line-through">{formatPrice(compareAt, currency)}</span>
                  <span className="text-xs font-bold text-red-400">-{discountPct}% OFF</span>
                </div>
              )}
            </div>
            {hasDiscount && savings > 0 && (
              <div className="mt-1 text-sm text-emerald-400">You save {formatPrice(savings, currency)}</div>
            )}

            {/* Short description */}
            {product.description && (
              <p className="mt-4 text-sm leading-relaxed text-slate-400">{product.description}</p>
            )}

            {/* Stock */}
            <div className="mt-4">
              {soldOut ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-400" /> Out of Stock
                </span>
              ) : lowStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-yellow-400">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" /> Only {product.stock} left — Order soon!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> In Stock ({product.stock} available)
                </span>
              )}
            </div>

            {/* Delivery */}
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <DeliveryIcon className="h-5 w-5 shrink-0 text-blue-400" />
              <div>
                <div className="font-semibold text-white">{deliveryText}</div>
                <div className="text-[11px] text-slate-400">
                  {product.digital ? 'Digital product — delivered via email instantly after payment' : 'Physical product — ships with tracked express delivery'}
                </div>
              </div>
            </div>

            {/* Quantity + Actions */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="grid h-7 w-7 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center font-mono text-sm font-bold text-white">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="grid h-7 w-7 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={addToCart}
                disabled={soldOut}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-40"
              >
                <ShoppingCart className="mr-2 inline h-4 w-4" /> Add to Cart
              </button>
              <button
                onClick={buyNow}
                disabled={soldOut}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110 disabled:opacity-40"
              >
                Buy Now <ArrowRight className="ml-2 inline h-4 w-4" />
              </button>
              <button
                onClick={toggleWishlist}
                className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-xl border transition', wishlist ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white')}
              >
                <Heart className={cn('h-5 w-5', wishlist && 'fill-current')} />
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span className="text-[10px] text-slate-400">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <CheckCircle2 className="h-5 w-5 text-blue-400" />
                <span className="text-[10px] text-slate-400">Verified Product</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <KeyRound className="h-5 w-5 text-violet-400" />
                <span className="text-[10px] text-slate-400">Instant Access</span>
              </div>
            </div>

            {/* SKU */}
            <div className="mt-4 font-mono text-xs text-slate-500">SKU: {product.sku}</div>
          </div>
        </div>

        {/* Tabs section */}
        <div className="mt-10">
          <div className="flex gap-1 overflow-x-auto border-b border-white/5 scrollbar-thin">
            {FAQ_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn('shrink-0 px-4 py-3 text-sm font-medium transition', activeTab === tab.id ? 'border-b-2 border-blue-500 text-white' : 'text-slate-400 hover:text-white')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <p className="text-sm leading-relaxed text-slate-300">{product.description || `${product.name} is a premium digital product available at PlayBeat Digital. Enjoy instant delivery and verified quality.`}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-400">
                  <li>✓ Premium verified product from PlayBeat Digital</li>
                  <li>✓ Instant digital delivery (or tracked shipping for hardware)</li>
                  <li>✓ Buyer protection and satisfaction guarantee</li>
                  <li>✓ 24/7 customer support via WhatsApp & Telegram</li>
                </ul>
              </div>
            )}
            {activeTab === 'features' && (
              <div className="space-y-3 text-sm text-slate-300">
                <p>Key features of {product.name}:</p>
                <ul className="space-y-2">
                  <li>✓ Premium quality — verified and tested</li>
                  <li>✓ Category: {product.category || 'Digital Product'}</li>
                  <li>✓ Region: {product.region || 'Global'}</li>
                  <li>✓ Delivery: {deliveryText}</li>
                  {product.tags.length > 0 && <li>✓ Tags: {product.tags.join(', ')}</li>}
                </ul>
              </div>
            )}
            {activeTab === 'whats-included' && (
              <div className="space-y-3 text-sm text-slate-300">
                <p>With your purchase of {product.name}, you receive:</p>
                <ul className="space-y-2">
                  <li>✓ {product.name} — full access/license</li>
                  <li>✓ Detailed activation instructions</li>
                  <li>✓ Setup guide (where applicable)</li>
                  <li>✓ Customer support access</li>
                  {product.digital && <li>✓ Instant digital delivery via email</li>}
                  {!product.digital && <li>✓ Tracked express shipping</li>}
                </ul>
              </div>
            )}
            {activeTab === 'delivery' && (
              <div className="space-y-3 text-sm text-slate-300">
                <p><strong>Delivery Method:</strong> {deliveryText}</p>
                {product.digital ? (
                  <p>After successful payment verification, your digital product will be delivered instantly to your email address and PlayBeat account dashboard. Most orders are processed within minutes, 24/7.</p>
                ) : (
                  <p>This physical product ships via express courier with full tracking. Delivery times: 1-3 business days domestically, 5-10 business days internationally. You'll receive tracking information via email once your order ships.</p>
                )}
              </div>
            )}
            {activeTab === 'compatibility' && (
              <div className="space-y-3 text-sm text-slate-300">
                <p>Compatibility information for {product.name}:</p>
                <ul className="space-y-2">
                  <li>✓ Works globally (region: {product.region || 'Global'})</li>
                  <li>✓ Compatible with major platforms and devices</li>
                  <li>✓ Detailed compatibility info provided with purchase</li>
                </ul>
              </div>
            )}
            {activeTab === 'activation' && (
              <div className="space-y-3 text-sm text-slate-300">
                <p><strong>Activation Instructions for {product.name}:</strong></p>
                <ol className="space-y-2">
                  <li>1. Complete your purchase via the Buy Now button above</li>
                  <li>2. Check your email for delivery confirmation and activation details</li>
                  <li>3. Follow the step-by-step activation guide provided</li>
                  <li>4. Contact support if you need any assistance</li>
                </ol>
                <p className="mt-3 text-xs text-slate-500">Need help? Contact our 24/7 support via WhatsApp or Telegram.</p>
              </div>
            )}
            {activeTab === 'faq' && (
              <div className="space-y-3 text-sm text-slate-300">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="font-semibold text-white">How long does delivery take?</p>
                  <p className="mt-1 text-slate-400">{product.digital ? 'Digital products are delivered instantly after payment.' : 'Hardware ships within 1-3 business days with tracking.'}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="font-semibold text-white">Can I get a refund?</p>
                  <p className="mt-1 text-slate-400">Yes, if the product is undelivered or doesn't work as described. See our Refund Policy.</p>
                </div>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {rating > 0 ? (
                  <>
                    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="text-center">
                        <div className="font-mono text-4xl font-bold text-white">{rating.toFixed(1)}</div>
                        <div className="mt-1 flex items-center gap-0.5">
                          {[1,2,3,4,5].map(i => <Star key={i} className={cn('h-3 w-3', i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600')} />)}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400">{reviewCount} reviews</div>
                      </div>
                      <div className="flex-1 space-y-1">
                        {[5,4,3,2,1].map(s => (
                          <div key={s} className="flex items-center gap-2 text-xs">
                            <span className="w-3 text-slate-400">{s}</span>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                              <div className="h-full bg-yellow-400" style={{ width: `${s === 5 ? 70 : s === 4 ? 20 : s === 3 ? 7 : s === 2 ? 2 : 1}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold tracking-tight text-white">Related Products</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currency={currency}
                  onAddToCart={(prod) => {
                    try {
                      const cart = JSON.parse(localStorage.getItem('pb_cart_v2') || '[]')
                      cart.push({ ...prod, qty: 1 })
                      localStorage.setItem('pb_cart_v2', JSON.stringify(cart))
                      toast.success('Added to cart')
                      window.dispatchEvent(new Event('storage'))
                    } catch {}
                  }}
                  onBuyNow={(prod) => router.push(`/product/${prod.id}`)}
                  onQuickView={(prod) => router.push(`/product/${prod.id}`)}
                  onToggleWishlist={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Back to store */}
      <div className="mx-auto max-w-7xl px-4 pb-8 lg:px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition hover:text-blue-300">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>
      </div>
    </div>
  )
}

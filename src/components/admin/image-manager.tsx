'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Search,
  Upload,
  Loader2,
  X,
  Check,
  Trash2,
  Star,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: number
  url: string
  source: string
  width: number
  height: number
  isSquare: boolean
  aspect: number
}

interface Product {
  id: string
  sku: string
  name: string
  image?: string | null
  images?: string[]
}

interface ImageManagerProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  product: Product | null
  onSaved?: () => void
}

export function ImageManager({ open, onOpenChange, product, onSaved }: ImageManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [gallery, setGallery] = useState<string[]>([])
  const [primaryImage, setPrimaryImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize when product changes
  const initProduct = useCallback(() => {
    if (product) {
      const imgs = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : []
      setGallery(imgs)
      setPrimaryImage(product.image || imgs[0] || null)
      setSearchQuery(`${product.name.replace(/\s*—.*$/, '').replace(/\*\*/g, '').trim()} product`)
    }
  }, [product])

  // Search web for images
  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearching(true)
    setResults([])
    try {
      const res = await fetch(
        `/api/products/search-image?query=${encodeURIComponent(searchQuery)}`,
        { credentials: 'include' }
      )
      const data = await res.json()
      if (data?.ok) {
        setResults(data.results || [])
        if ((data.results || []).length === 0) {
          toast.info('No images found — try a different search term.')
        }
      } else {
        throw new Error(data?.error || 'Search failed')
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Search failed')
    } finally {
      setSearching(false)
    }
  }

  // Select an image from search results
  async function handleSelectImage(url: string) {
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${product!.id}/images`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ image: url }),
      })
      const data = await res.json()
      if (!data?.ok) throw new Error(data?.error || 'Failed to set image')
      
      // Update local state
      if (!gallery.includes(url)) {
        setGallery([...gallery, url])
      }
      setPrimaryImage(url)
      toast.success('Image set as primary')
      onSaved?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to set image')
    } finally {
      setSaving(false)
    }
  }

  // Upload custom image
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !product) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`/api/products/${product.id}/upload-image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const data = await res.json()
      if (!data?.ok) throw new Error(data?.error || 'Upload failed')
      
      setGallery(data.data.images || [])
      setPrimaryImage(data.data.image)
      toast.success('Image uploaded successfully')
      onSaved?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Set primary image from gallery
  async function handleSetPrimary(url: string) {
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${product!.id}/images`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ image: url }),
      })
      const data = await res.json()
      if (!data?.ok) throw new Error(data?.error || 'Failed')
      setPrimaryImage(url)
      toast.success('Primary image updated')
      onSaved?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  // Delete image from gallery
  async function handleDeleteImage(url: string) {
    setSaving(true)
    try {
      const res = await fetch(`/api/products/${product!.id}/images`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deleteImage: url }),
      })
      const data = await res.json()
      if (!data?.ok) throw new Error(data?.error || 'Failed')
      
      const newGallery = gallery.filter((g) => g !== url)
      setGallery(newGallery)
      if (primaryImage === url) {
        setPrimaryImage(newGallery[0] || null)
      }
      toast.success('Image removed')
      onSaved?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  if (!product) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) initProduct()
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-white/10 bg-[#0a0e1a]/95 text-white backdrop-blur-xl scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <ImageIcon className="h-5 w-5 text-blue-400" />
            Image Manager — {product.sku}
          </DialogTitle>
        </DialogHeader>

        {/* Current gallery */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Current Gallery ({gallery.length} images)
          </div>
          {gallery.length === 0 ? (
            <div className="grid h-24 place-items-center rounded-xl border border-dashed border-white/10 text-sm text-slate-500">
              No images yet
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {gallery.map((img, i) => (
                <div
                  key={i}
                  className={cn(
                    'group relative aspect-square overflow-hidden rounded-lg border-2 transition',
                    primaryImage === img ? 'border-blue-500' : 'border-white/10'
                  )}
                >
                  <img src={img} alt={`Gallery ${i + 1}`} className="h-full w-full object-contain" />
                  {/* Primary star */}
                  {primaryImage === img && (
                    <div className="absolute left-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-blue-500">
                      <Star className="h-3 w-3 fill-white text-white" />
                    </div>
                  )}
                  {/* Actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 opacity-0 transition group-hover:opacity-100">
                    {primaryImage !== img && (
                      <button
                        onClick={() => handleSetPrimary(img)}
                        disabled={saving}
                        title="Set as primary"
                        className="grid h-7 w-7 place-items-center rounded-lg bg-blue-500/80 text-white transition hover:bg-blue-500"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteImage(img)}
                      disabled={saving}
                      title="Delete"
                      className="grid h-7 w-7 place-items-center rounded-lg bg-red-500/80 text-white transition hover:bg-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload custom image */}
        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Upload Custom Image
          </div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] py-6 text-sm text-slate-400 transition hover:border-blue-500/40 hover:bg-white/[0.04]"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 text-blue-400" />
                Click to upload (JPEG, PNG, WebP — max 5MB)
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {/* Web image search */}
        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Search Web for Images
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for product image..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/40"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>

          {/* Search results */}
          {results.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {results.map((r) => (
                <div
                  key={r.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]"
                >
                  <img
                    src={r.url}
                    alt={`Result ${r.id + 1}`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/70 opacity-0 transition group-hover:opacity-100">
                    <span className="text-[9px] text-slate-400">
                      {r.width > 0 ? `${r.width}×${r.height}` : 'Unknown'} · {r.source}
                    </span>
                    <button
                      onClick={() => handleSelectImage(r.url)}
                      disabled={saving}
                      className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-blue-600"
                    >
                      <Check className="h-3 w-3" />
                      Select
                    </button>
                  </div>
                  {/* Source link */}
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
          {searching && (
            <div className="mt-3 grid place-items-center py-8 text-sm text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              <span className="mt-2">Searching the web...</span>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

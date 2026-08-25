import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/require-auth'

interface RouteCtx {
  params: Promise<{ id: string }>
}

// PUT /api/products/[id]/images — update primary image or gallery
export async function PUT(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))

  const existing = await db.product.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ ok: false, error: 'Not found.' }, { status: 404 })
  }

  const data: Record<string, unknown> = {}

  // Set primary image
  if (typeof body.image === 'string') {
    data.image = body.image || null
    // Also add to gallery if not already there
    if (body.image && !(existing.images || []).includes(body.image)) {
      data.images = [...(existing.images || []), body.image]
    }
  }

  // Replace entire gallery
  if (Array.isArray(body.images)) {
    data.images = body.images
    // Set primary to first if no primary
    if (!body.image && body.images.length > 0) {
      data.image = body.images[0]
    }
  }

  // Reorder gallery (swap positions)
  if (Array.isArray(body.reorder) && body.reorder.length === 2) {
    const [from, to] = body.reorder
    const imgs = [...(existing.images || [])]
    if (from >= 0 && from < imgs.length && to >= 0 && to < imgs.length) {
      const [item] = imgs.splice(from, 1)
      imgs.splice(to, 0, item)
      data.images = imgs
      if (to === 0) data.image = imgs[0]
    }
  }

  // Delete an image from gallery
  if (typeof body.deleteImage === 'string') {
    const imgs = (existing.images || []).filter((img) => img !== body.deleteImage)
    data.images = imgs
    if (existing.image === body.deleteImage) {
      data.image = imgs[0] || null
    }
  }

  const updated = await db.product.update({ where: { id }, data })
  await db.activityLog.create({
    data: {
      action: 'product.update_images',
      detail: `Updated images for ${updated.sku}`,
      actor: auth.session.email,
    },
  })
  return NextResponse.json({ ok: true, data: { image: updated.image, images: updated.images } })
}

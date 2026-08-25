import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/require-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

interface RouteCtx {
  params: Promise<{ id: string }>
}

// POST /api/products/[id]/upload-image — upload custom image (multipart)
export async function POST(req: NextRequest, ctx: RouteCtx) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const { id } = await ctx.params
  const existing = await db.product.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ ok: false, error: 'Not found.' }, { status: 404 })
  }

  const formData = await req.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ ok: false, error: 'Expected multipart/form-data.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'No file uploaded.' }, { status: 400 })
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { ok: false, error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF, SVG.` },
      { status: 400 }
    )
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { ok: false, error: 'File too large (max 5MB).' },
      { status: 400 }
    )
  }

  // Generate SEO-friendly filename: brand-model-sku.webp
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const slugName = existing.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  const filename = `${slugName}-${existing.sku.toLowerCase()}.${ext}`

  // Save to /public/assets/images/products/
  const uploadDir = path.join(process.cwd(), 'public', 'assets', 'images', 'products')
  try {
    await mkdir(uploadDir, { recursive: true })
  } catch {
    // dir might already exist
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const filePath = path.join(uploadDir, filename)
  await writeFile(filePath, buffer)

  // Public URL path
  const imageUrl = `/assets/images/products/${filename}`

  // Update product
  const images = [...(existing.images || []), imageUrl]
  const updated = await db.product.update({
    where: { id },
    data: {
      image: existing.image || imageUrl, // set as primary if none
      images,
    },
  })

  await db.activityLog.create({
    data: {
      action: 'product.upload_image',
      detail: `Uploaded image for ${existing.sku}: ${filename}`,
      actor: auth.session.email,
    },
  })

  return NextResponse.json({
    ok: true,
    data: { image: updated.image, images: updated.images, url: imageUrl },
  })
}

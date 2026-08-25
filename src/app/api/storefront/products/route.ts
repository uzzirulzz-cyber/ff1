import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/storefront/products?category=&search=
// Public endpoint — returns only active products for the storefront.
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const category = url.searchParams.get('category') || ''
  const search = url.searchParams.get('search') || ''

  const where: Record<string, unknown> = { status: 'active' }
  if (category && category !== 'all') where.category = category
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ]
  }

  const products = await db.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      sku: true,
      name: true,
      description: true,
      category: true,
      price: true,
      currency: true,
      stock: true,
      image: true,
      tags: true,
      digital: true,
    },
  })

  const categories = await db.product.findMany({
    where: { status: 'active' },
    select: { category: true },
    distinct: ['category'],
  })

  return NextResponse.json({
    ok: true,
    data: products,
    categories: categories
      .map((p) => p.category)
      .filter(Boolean) as string[],
  })
}

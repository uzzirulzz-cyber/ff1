import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/storefront/checkout
// Body: { customerName, customerEmail?, items: [{productId, qty}], paymentMethod? }
// Public — creates an order, decrements stock.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))

  const customerName = String(body?.customerName || '').trim()
  const customerEmail = body?.customerEmail ? String(body.customerEmail).trim().toLowerCase() : null
  const items = Array.isArray(body?.items) ? body.items : []
  const paymentMethod = body?.paymentMethod ? String(body.paymentMethod) : null

  if (!customerName) {
    return NextResponse.json(
      { ok: false, error: 'Name is required.' },
      { status: 400 }
    )
  }
  if (items.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Cart is empty.' },
      { status: 400 }
    )
  }

  // Lookup prices from DB to prevent tampering
  const itemRows = []
  let total = 0
  for (const it of items) {
    const product = await db.product.findUnique({ where: { id: String(it.productId) } })
    if (!product) continue
    if (product.status !== 'active') continue
    const qty = Math.max(1, Math.min(Number(it.qty) || 1, 99))
    if (product.stock < qty) {
      return NextResponse.json(
        { ok: false, error: `Insufficient stock for ${product.name}.` },
        { status: 400 }
      )
    }
    itemRows.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty,
    })
    total += product.price * qty
  }

  if (itemRows.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'No valid products in cart.' },
      { status: 400 }
    )
  }

  // Generate order number
  const lastOrder = await db.order.findFirst({ orderBy: { createdAt: 'desc' } })
  const nextNum = lastOrder ? parseInt(lastOrder.orderNumber.replace(/\D/g, '') || '0', 10) + 1 : 1
  const orderNumber = `PB-${String(nextNum).padStart(5, '0')}`

  const order = await db.order.create({
    data: {
      orderNumber,
      customerName,
      customerEmail,
      items: itemRows,
      total,
      currency: 'Rs',
      status: 'pending',
      paymentMethod,
    },
  })

  // Decrement stock
  for (const it of itemRows) {
    await db.product.update({
      where: { id: it.productId },
      data: { stock: { decrement: it.qty } },
    })
  }

  // Update customer stats
  if (customerEmail) {
    const existing = await db.customer.findUnique({ where: { email: customerEmail } })
    if (existing) {
      await db.customer.update({
        where: { id: existing.id },
        data: {
          orders: { increment: 1 },
          totalSpent: { increment: total },
        },
      })
    } else {
      await db.customer.create({
        data: {
          name: customerName,
          email: customerEmail,
          orders: 1,
          totalSpent: total,
        },
      })
    }
  }

  return NextResponse.json(
    {
      ok: true,
      data: {
        orderNumber: order.orderNumber,
        total,
        currency: order.currency,
        status: order.status,
      },
    },
    { status: 201 }
  )
}

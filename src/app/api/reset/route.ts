import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/require-auth'
import bcrypt from 'bcryptjs'

// Hidden default admin — sourced from env at runtime, never exposed to client
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@playbeat.digital'
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'playbeat1122'
const DEFAULT_ADMIN_NAME = process.env.ADMIN_NAME || 'PlayBeat Admin'

// POST /api/reset
// Wipes all transactional data (products, orders, customers, activity logs)
// and re-seeds the database with the original sample dataset.
// Admin-only. Requires confirmation in body: { confirm: "RESET" }.
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if ('error' in auth) return auth.error

  const body = await req.json().catch(() => ({}))
  if (body?.confirm !== 'RESET') {
    return NextResponse.json(
      {
        ok: false,
        error: 'Confirmation required. Send { confirm: "RESET" } to proceed.',
      },
      { status: 400 }
    )
  }

  console.log('🗑️ Resetting PlayBeat database...')

  // Delete in dependency-safe order
  await db.order.deleteMany({})
  await db.product.deleteMany({})
  await db.customer.deleteMany({})
  await db.activityLog.deleteMany({})
  // Settings: keep, but reset storefront_status to online
  await db.setting.upsert({
    where: { key: 'storefront_status' },
    update: { value: 'online' },
    create: { key: 'storefront_status', value: 'online' },
  })

  // Re-seed admin user
  const hashed = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10)
  await db.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    update: { password: hashed, name: DEFAULT_ADMIN_NAME, role: 'admin' },
    create: {
      email: DEFAULT_ADMIN_EMAIL,
      password: hashed,
      name: DEFAULT_ADMIN_NAME,
      role: 'admin',
    },
  })

  // Re-seed products
  const products = [
    { sku: 'PSN-50-US', name: 'PlayStation Gift Card - $50 (USA)', description: 'Digital PSN gift card redeemable on US PlayStation Store.', category: 'Gift Cards', price: 24000, stock: 100, status: 'active', digital: true, tags: ['psn', 'usa', 'giftcard'] },
    { sku: 'PSN-25-US', name: 'PlayStation Gift Card - $25 (USA)', description: 'Digital PSN gift card redeemable on US PlayStation Store.', category: 'Gift Cards', price: 14000, stock: 100, status: 'active', digital: true, tags: ['psn', 'usa', 'giftcard'] },
    { sku: 'NFLX-1M', name: 'Netflix Premium 1 Month', description: 'Netflix Premium account, 1 month subscription, 4K streaming.', category: 'Streaming', price: 6800, stock: 50, status: 'active', digital: true, tags: ['netflix', 'streaming'] },
    { sku: 'SPFY-3M', name: 'Spotify Premium 3 Months', description: 'Spotify Premium individual plan, 3 months subscription.', category: 'Streaming', price: 4500, stock: 50, status: 'active', digital: true, tags: ['spotify', 'music'] },
    { sku: 'IPTV-12M', name: 'IPTV Subscription 12 Months', description: '12-month IPTV subscription with 10,000+ live channels and VOD.', category: 'IPTV', price: 8999, stock: 200, status: 'active', digital: true, tags: ['iptv', 'live-tv'] },
    { sku: 'XBOX-50-US', name: 'Xbox Gift Card - $50 (USA)', description: 'Digital Xbox gift card for US Microsoft Store.', category: 'Gift Cards', price: 23000, stock: 75, status: 'active', digital: true, tags: ['xbox', 'usa', 'giftcard'] },
    { sku: 'STEAM-20-US', name: 'Steam Wallet - $20 (USA)', description: 'Steam wallet code redeemable on US Steam Store.', category: 'Gift Cards', price: 10500, stock: 80, status: 'active', digital: true, tags: ['steam', 'usa', 'giftcard'] },
    { sku: 'NP-12M', name: 'NordVPN 12 Months', description: 'NordVPN 12-month subscription, secure and private browsing.', category: 'VPN', price: 5200, stock: 60, status: 'active', digital: true, tags: ['vpn', 'security'] },
    { sku: 'DZN-1M', name: 'Disney+ 1 Month Premium', description: 'Disney+ Premium 1 month subscription, 4K UHD streaming.', category: 'Streaming', price: 3200, stock: 40, status: 'active', digital: true, tags: ['disney', 'streaming'] },
    { sku: 'GP-50-US', name: 'Google Play Gift Card - $50 (USA)', description: 'Digital Google Play gift card redeemable on US Google Play Store.', category: 'Gift Cards', price: 23500, stock: 90, status: 'active', digital: true, tags: ['google', 'usa', 'giftcard'] },
    { sku: 'APP-25-US', name: 'Apple Gift Card - $25 (USA)', description: 'Apple gift card redeemable on US App Store, iTunes, Apple services.', category: 'Gift Cards', price: 13200, stock: 65, status: 'active', digital: true, tags: ['apple', 'usa', 'giftcard'] },
    { sku: 'AMZ-50-US', name: 'Amazon Gift Card - $50 (USA)', description: 'Amazon.com digital gift card for US store.', category: 'Gift Cards', price: 23800, stock: 70, status: 'active', digital: true, tags: ['amazon', 'usa', 'giftcard'] },
    { sku: 'CFG-1Y', name: 'ChatGPT Plus 1 Month', description: 'ChatGPT Plus 1 month subscription with priority access.', category: 'AI', price: 7800, stock: 30, status: 'active', digital: true, tags: ['ai', 'chatgpt'] },
    { sku: 'DSC-1Y', name: 'Discord Nitro 1 Year', description: 'Discord Nitro 12-month subscription with server boosts.', category: 'Streaming', price: 19500, stock: 35, status: 'active', digital: true, tags: ['discord', 'gaming'] },
    { sku: 'CRN-12M', name: 'Crunchyroll Mega 12 Months', description: 'Crunchyroll Mega Fan 12-month subscription, ad-free anime.', category: 'Streaming', price: 8200, stock: 28, status: 'active', digital: true, tags: ['anime', 'crunchyroll'] },
    { sku: 'YT-3M', name: 'YouTube Premium 3 Months', description: 'YouTube Premium 3-month subscription, ad-free + background play.', category: 'Streaming', price: 4200, stock: 55, status: 'active', digital: true, tags: ['youtube', 'music'] },
    { sku: 'ADP-1Y', name: 'Adobe Creative Cloud 1 Year', description: 'Adobe Creative Cloud All Apps 12-month subscription.', category: 'Software', price: 89000, stock: 10, status: 'active', digital: true, tags: ['adobe', 'design'] },
  ]
  for (const p of products) {
    await db.product.create({ data: { ...p, currency: 'Rs' } })
  }

  // Re-seed customers
  const customers = [
    { name: 'John Doe', email: 'john.doe@example.com', country: 'Singapore', orders: 3, totalSpent: 6800 },
    { name: 'Sarah Smith', email: 'sarah.s@example.com', country: 'USA', orders: 2, totalSpent: 4200 },
    { name: 'Mike Johnson', email: 'mike.j@example.com', country: 'UK', orders: 1, totalSpent: 1299 },
    { name: 'Emma Wilson', email: 'emma.w@example.com', country: 'Canada', orders: 4, totalSpent: 12400 },
    { name: 'David Brown', email: 'david.b@example.com', country: 'Australia', orders: 2, totalSpent: 5400 },
    { name: 'Lisa Garcia', email: 'lisa.g@example.com', country: 'Spain', orders: 1, totalSpent: 3200 },
    { name: 'Tom Wilson', email: 'tom.w@example.com', country: 'Germany', orders: 5, totalSpent: 18700 },
    { name: 'Anna Lee', email: 'anna.l@example.com', country: 'South Korea', orders: 2, totalSpent: 7800 },
  ]
  for (const c of customers) {
    await db.customer.create({ data: c })
  }

  // Re-seed orders
  const ordersData = [
    { customerName: 'John Doe', customerEmail: 'john.doe@example.com', total: 2499, status: 'completed', paymentMethod: 'Card' },
    { customerName: 'Sarah Smith', customerEmail: 'sarah.s@example.com', total: 1499, status: 'completed', paymentMethod: 'PayPal' },
    { customerName: 'Mike Johnson', customerEmail: 'mike.j@example.com', total: 1299, status: 'completed', paymentMethod: 'Crypto' },
    { customerName: 'Emma Wilson', customerEmail: 'emma.w@example.com', total: 3200, status: 'processing', paymentMethod: 'Card' },
    { customerName: 'David Brown', customerEmail: 'david.b@example.com', total: 899, status: 'pending', paymentMethod: 'PayPal' },
  ]
  for (let i = 0; i < ordersData.length; i++) {
    const o = ordersData[i]
    const orderNumber = `PB-${String(20 + i).padStart(5, '0')}`
    await db.order.create({
      data: {
        orderNumber,
        ...o,
        currency: 'Rs',
        items: [{ productId: 'seed-item', name: 'PlayBeat Product', price: o.total, qty: 1 }],
      },
    })
  }

  await db.activityLog.create({
    data: {
      action: 'system.reset',
      detail: 'Database reset to seed state',
      actor: auth.session.email,
    },
  })

  console.log('✅ Reset complete')
  return NextResponse.json({
    ok: true,
    message: 'Database reset to seed state.',
    counts: {
      products: products.length,
      customers: customers.length,
      orders: ordersData.length,
    },
  })
}

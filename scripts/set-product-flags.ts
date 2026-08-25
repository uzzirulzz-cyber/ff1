/**
 * Update products with featured/trending/bestSeller/flashDeal flags
 * and compareAtPrice for discounts, based on category and SKU patterns.
 * 
 * Usage: bun run scripts/set-product-flags.ts
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient({ log: ['error'] })

async function main() {
  console.log('🏷️ Setting product flags (featured, trending, bestSeller, flashDeal, compareAtPrice)...')

  const products = await db.product.findMany({})
  let updated = 0

  for (const p of products) {
    const data: Record<string, unknown> = {}

    // Set compareAtPrice (original price + 15% markup for "discount" display)
    if (p.price > 0 && !p.compareAtPrice) {
      data.compareAtPrice = Math.round(p.price * 1.15 * 100) / 100
    }

    // Best sellers: top-selling categories
    if (
      p.sku.startsWith('AI-') ||
      p.sku.startsWith('GC-') ||
      p.sku.startsWith('STR-') ||
      p.sku.startsWith('IPTV-')
    ) {
      if (!p.bestSeller) data.bestSeller = true
    }

    // Trending: AI tools and streaming
    if (
      p.category === 'AI & Productivity' ||
      p.category === 'Streaming Accounts' ||
      p.category === 'IPTV'
    ) {
      if (!p.trending) data.trending = true
    }

    // Featured: one per category (first product)
    if (!p.featured) {
      const catFirst = products.filter(x => x.category === p.category && x.sku < p.sku)
      if (catFirst.length === 0) data.featured = true
    }

    // Flash deals: some gift cards and IPTV
    if (
      (p.sku.startsWith('GC-') && parseInt(p.sku.split('-')[1] || '0') % 5 === 0) ||
      p.sku.startsWith('IPTV-') ||
      p.sku.startsWith('PROJ-004') ||
      p.sku.startsWith('PROJ-006')
    ) {
      if (!p.flashDeal) data.flashDeal = true
      // Bigger discount for flash deals
      data.compareAtPrice = Math.round(p.price * 1.25 * 100) / 100
    }

    // Set rating and reviewCount for products with images
    if (p.image && !p.rating) {
      data.rating = Math.round((4.2 + Math.random() * 0.7) * 10) / 10
      data.reviewCount = Math.floor(Math.random() * 200) + 12
      data.salesCount = Math.floor(Math.random() * 500) + 20
    }

    // Set deliveryMethod for projectors
    if (p.category === 'Smart Projectors' && !p.deliveryMethod) {
      data.deliveryMethod = 'shipping'
    }

    if (Object.keys(data).length > 0) {
      await db.product.update({ where: { id: p.id }, data })
      updated++
    }
  }

  console.log(`✅ Updated ${updated} products with flags`)
  
  // Print summary
  const flagged = await db.product.findMany({
    where: { status: 'active' },
    select: { featured: true, trending: true, bestSeller: true, flashDeal: true, compareAtPrice: true }
  })
  console.log(`  Featured: ${flagged.filter(p => p.featured).length}`)
  console.log(`  Trending: ${flagged.filter(p => p.trending).length}`)
  console.log(`  Best Sellers: ${flagged.filter(p => p.bestSeller).length}`)
  console.log(`  Flash Deals: ${flagged.filter(p => p.flashDeal).length}`)
  console.log(`  With compareAtPrice: ${flagged.filter(p => p.compareAtPrice).length}`)
}

main()
  .catch(e => { console.error('❌', e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })

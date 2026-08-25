/**
 * Fetch real web images for all 88 digital products (products.json).
 * Saves results back to products.json with imageUrl field.
 * Uses z-ai image-search CLI in parallel (3 at a time) for speed.
 *
 * Usage: bun run scripts/fetch-product-images.ts
 */
import { execSync } from 'child_process'
import fs from 'fs'

const INPUT_PATH = '/home/z/my-project/scripts/products.json'

interface Product {
  sku: string
  name: string
  description: string
  category: string
  priceUSD: number
  originalPrice: number
  originalCurrency: string
  digital: boolean
  tags: string[]
  stock: number
  status: 'active' | 'draft'
  imageUrl?: string
}

function searchImage(query: string): { url: string; source: string; width: number; height: number } | null {
  try {
    const cmd = `z-ai image-search -q "${query.replace(/"/g, '\\"')}" -c 3 --no-rank`
    const stdout = execSync(cmd, { encoding: 'utf-8', timeout: 90000 })
    const jsonStart = stdout.indexOf('{')
    if (jsonStart === -1) return null
    const data = JSON.parse(stdout.slice(jsonStart))
    const results = data?.results || data?.data?.results || []
    if (Array.isArray(results) && results.length > 0) {
      // Prefer square-ish images (aspect ratio close to 1)
      const sorted = results
        .filter((r: any) => r.original_url)
        .sort((a: any, b: any) => {
          const aRatio = Math.abs(parseInt(a.original_width) - parseInt(a.original_height))
          const bRatio = Math.abs(parseInt(b.original_width) - parseInt(b.original_height))
          return aRatio - bRatio
        })
      const best = sorted[0] || results[0]
      return {
        url: best.original_url,
        source: best.source || '',
        width: parseInt(best.original_width) || 0,
        height: parseInt(best.original_height) || 0,
      }
    }
    return null
  } catch (e) {
    return null
  }
}

async function runWithConcurrency<T>(items: T[], fn: (item: T) => Promise<void>, limit: number) {
  const queue = [...items]
  const workers: Promise<void>[] = []
  for (let i = 0; i < limit; i++) {
    workers.push((async () => {
      while (queue.length > 0) {
        const item = queue.shift()!
        await fn(item)
      }
    })())
  }
  await Promise.all(workers)
}

async function main() {
  const products: Product[] = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf-8'))
  console.log(`🔍 Fetching images for ${products.length} products (concurrency: 3)...\n`)

  let found = 0
  let processed = 0

  await runWithConcurrency(
    products,
    async (p) => {
      processed++
      if (p.imageUrl) {
        found++
        console.log(`[${processed}/${products.length}] ⏭️  ${p.sku} already has image`)
        return
      }
      // Build search query from product name + brand/category
      const cleanName = p.name.replace(/\*\*/g, '').replace(/\s*—.*$/, '').trim()
      const query = `${cleanName} product`
      const result = searchImage(query)
      if (result) {
        p.imageUrl = result.url
        found++
        console.log(`[${processed}/${products.length}] ✅ ${p.sku}: ${result.url.substring(0, 70)}...`)
      } else {
        console.log(`[${processed}/${products.length}] ❌ ${p.sku}: no image found`)
      }
      // Save incrementally
      fs.writeFileSync(INPUT_PATH, JSON.stringify(products, null, 2))
    },
    3
  )

  fs.writeFileSync(INPUT_PATH, JSON.stringify(products, null, 2))
  console.log(`\n✅ Saved with images: ${found}/${products.length}`)
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})

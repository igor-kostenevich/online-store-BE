import { PrismaClient } from '@prisma/client'
import { slugify } from 'transliteration'

const prisma = new PrismaClient()

const topCategories = [
  "Woman’s Fashion",
  "Men’s Fashion",
  "Electronics",
  "Home & Garden",
  "Sports",
  "Toys"
]

const subcategories = {
  "Woman’s Fashion": [
    "Dresses", "Shoes", "Bags", "Accessories", "Outerwear", "Lingerie"
  ],
  "Men’s Fashion": [
    "Suits", "Casual Wear", "Shoes", "Watches", "Jackets", "T-Shirts"
  ],
  "Electronics": [
    "Phones", "Laptops", "Tablets", "Cameras", "Accessories", "Wearables", 'Gaming'
  ]
}

export async function seedCategories() {
  const parentMap: Record<string, string> = {}
  let totalCount = 0

  // Create top-level categories
  for (const name of topCategories) {
    const slug = slugify(name)
    const category = await prisma.category.create({
      data: { name, slug }
    })

    parentMap[slug] = category.id
    totalCount++

    // Create subcategories if needed
    if (subcategories[name]) {
      for (const sub of subcategories[name]) {
        await prisma.category.create({
          data: {
            name: sub,
            slug: `${slug}-${slugify(sub)}`,
            parentId: category.id
          }
        })
        totalCount++
      }
    }
  }

  return totalCount
}

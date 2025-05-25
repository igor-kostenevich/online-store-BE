import { PrismaClient, $Enums } from '@prisma/client'
import { slugify } from 'transliteration'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
dotenv.config()

const APP_DOMAIN = process.env.APP_DOMAIN || 'http://localhost:3001'

const prisma = new PrismaClient()
const IMAGES_DIR = path.join(process.cwd(), 'public', 'seeds', 'images')

const adjectiveMap = {
  fashion: ['Elegant', 'Stylish', 'Trendy', 'Chic', 'Modern'],
  electronics: ['Advanced', 'Innovative', 'Smart', 'High-tech', 'Reliable'],
  sports: ['Durable', 'Professional', 'Athletic', 'Robust', 'Lightweight'],
  toys: ['Fun', 'Educational', 'Colorful', 'Interactive', 'Creative'],
  medicine: ['Effective', 'Trusted', 'Safe', 'Reliable', 'Premium'],
  groceries: ['Fresh', 'Organic', 'Natural', 'Healthy', 'Tasty'],
  beauty: ['Luxurious', 'Nourishing', 'Gentle', 'Radiant', 'Hydrating']
}

const descriptionMap = {
  fashion: ['This premium piece offers timeless style and comfort, perfect for fashion enthusiasts.', 'Meticulously crafted for those who value both style and substance.', 'Elevate your look with this designer-crafted item, blending elegance with wearability.', 'A standout piece for any wardrobe, designed for versatility and sophistication.', 'Combining top-quality materials with modern design trends for the ultimate fashion statement.'],
  electronics: ['Engineered for superior performance with sleek, modern aesthetics.', 'Packed with cutting-edge features designed for a connected lifestyle.', 'Innovative design meets robust functionality for tech lovers.', 'Perfect for professionals and enthusiasts who demand excellence.', 'Stay ahead with this state-of-the-art device, crafted for efficiency.'],
  sports: ['Maximize your workouts with gear designed for champions.', 'Crafted for athletes pushing their limits every day.', 'Lightweight and powerful, built to boost your performance.', 'Engineered to handle the toughest conditions on the field.', 'Your ultimate companion for fitness and adventure.'],
  toys: ['Captivate imaginations with this delightful, interactive toy.', 'Designed to inspire creativity and endless fun.', 'Safe, colorful, and crafted for joyful learning and play.', 'Spark curiosity and exploration with every play session.', 'Thoughtfully made to provide both entertainment and education.'],
  medicine: ['Formulated for effective, reliable relief you can trust.', 'Developed with the latest research and trusted by professionals.', 'Safe and effective, supporting your health and wellness.', 'Premium formulation designed for optimal results.', 'Supporting well-being with top-tier care and precision.'],
  groceries: ['Sourced fresh and packed with natural goodness.', 'Wholesome ingredients for delicious, healthy meals.', 'Bursting with flavor, perfect for your family’s table.', 'Delivering farm-to-table freshness straight to your kitchen.', 'Ideal for creating memorable, nourishing dishes.'],
  beauty: ['Indulge in luxurious skincare crafted for radiant results.', 'Designed to rejuvenate, nourish, and enhance your natural glow.', 'Crafted with premium ingredients for ultimate self-care.', 'Reveal beautiful, healthy skin with every use.', 'Elevate your beauty routine with these exceptional essentials.']
}

function groupImagesByPrefix(files) {
  const groups = {}
  for (const file of files) {
    const [prefix] = file.split('_')
    if (!groups[prefix]) groups[prefix] = []
    groups[prefix].push(file)
  }
  return groups
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function detectCategoryType(slug) {
  if (slug.includes('fashion')) return 'fashion'
  if (slug.includes('electronics')) return 'electronics'
  if (slug.includes('sports')) return 'sports'
  if (slug.includes('toys')) return 'toys'
  if (slug.includes('medicine')) return 'medicine'
  if (slug.includes('groceries') || slug.includes('pets')) return 'groceries'
  if (slug.includes('beauty') || slug.includes('health')) return 'beauty'
  return 'general'
}

export async function seedProducts() {
  const allCategories = await prisma.category.findMany({ include: { children: true } })
  const leafCategories = allCategories.filter(cat => cat.children.length === 0)
  let totalCount = 0

  for (const category of leafCategories) {
    const catSlug = category.slug
    const fixedSlug = catSlug.replace(/^woman-s-/, 'womans-').replace(/^men-s-/, 'mens-')
    const folderPath = path.join(IMAGES_DIR, fixedSlug)

    if (!fs.existsSync(folderPath)) {
      console.warn(`⚠️ No image folder for ${catSlug}, skipping`)
      continue
    }

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.webp'))
    const grouped = groupImagesByPrefix(files)
    const allGroups = Object.entries(grouped)
    const typeKey = detectCategoryType(catSlug)
    const productCount = Math.floor(Math.random() * (105 - 30 + 1)) + 30

    for (let i = 0; i < productCount; i++) {
      const [prefix, imageFiles] = getRandom(allGroups)
      const cleanNamePart = prefix.replace(/^(.*?)-(.*)/, (_, cat, name) => name || cat).replace(/\.webp/g, '').replace(/[-_]/g, ' ').trim()
      const adjective = getRandom(adjectiveMap[typeKey] || ['Quality'])
      const suffix = getRandom(['Exclusive Edition', 'Limited Release', 'Signature Series', 'Premium Line', 'Designer Collection'])
      const name = `${adjective} ${cleanNamePart} ${suffix}`.replace(/\s+/g, ' ').trim()
      const slug = `${slugify(name)}-${Math.random().toString(36).substring(2, 8)}`

      const description = getRandom(descriptionMap[typeKey] || ['A great product for everyday use.'])
      const price = parseFloat((Math.random() * (500 - 10) + 10).toFixed(2))

      let oldPrice: number | null = null
      let discount: number | null = null
      if (Math.random() < 0.5) {
        const calculatedOldPrice = parseFloat((price * (1.1 + Math.random() * 0.4)).toFixed(2))
        oldPrice = calculatedOldPrice
        discount = Math.round(((calculatedOldPrice - price) / calculatedOldPrice) * 100)
      }

      const stock = Math.floor(Math.random() * 201)

      const colors = catSlug.includes('fashion') || catSlug.includes('electronics')
        ? Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`)
        : []

      const sizes = catSlug.includes('fashion')
        ? (['XS', 'S', 'M', 'L', 'XL'].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 1) as $Enums.Size[])
        : undefined

      const productImages = imageFiles.map((file, idx) => ({
        url: `${APP_DOMAIN}/seeds/images/${fixedSlug}/${file}`,
        isMain: idx === 0,
      }))

      try {
        await prisma.product.create({
          data: {
            name,
            slug,
            description,
            price,
            oldPrice,
            discount,
            stock,
            categoryId: category.id,
            colors,
            sizes,
            isNew: Math.random() < 0.5,
            images: { create: productImages },
          },
        })
        totalCount++
      } catch (e) {
        if (e.code === 'P2002' && e.meta?.target?.includes('slug')) {
          console.warn(`⚠️ Duplicate slug=${slug}, skipping`)
          continue
        }
        throw e
      }
    }
  }

  return totalCount
}

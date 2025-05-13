import { BadRequestException, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()
import { getUsers } from './seed-data/users'
import { seedCategories } from './seed-data/categories';
import { seedProducts } from './seed-data/products';
import { seedReviews } from './seed-data/reviews';

async function main() {
  try {
    Logger.log('Seeding database...')
    
    await prisma.$transaction([
      prisma.review.deleteMany(),
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.productImage.deleteMany(),
      prisma.product.deleteMany(),
      prisma.category.deleteMany(),
      prisma.user.deleteMany(),
    ])

    const users = await getUsers()
    await prisma.user.createMany({
      data: users,
    })
    Logger.log(`Seeded ${users.length} users`)

    const categoryCount = await seedCategories()
    Logger.log(`Seeded ${categoryCount} categories`)

    const products = await seedProducts()
    Logger.log(`Seeded ${products} products`)

    const reviews = await seedReviews()
    Logger.log(`Seeded ${reviews} reviews`)
  } catch (error) {
    Logger.log(error)
    throw new BadRequestException('Error seeding database')
  } finally {
    Logger.log('Closing DB connection...')
    await prisma.$disconnect()
    Logger.log('DB connection closed')
  }
}


main()
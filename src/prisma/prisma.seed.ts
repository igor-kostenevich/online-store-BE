import { BadRequestException, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()
import { getUsers } from './seed-data/users'
import { seedCategories } from './seed-data/categories';

async function main() {
  try {
    Logger.log('Seeding database...')
    
    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.category.deleteMany(),
    ])

    const users = await getUsers()
    await prisma.user.createMany({
      data: users,
    })
    Logger.log(`Seeded ${users.length} users`)

    const categoryCount = await seedCategories()
    Logger.log(`Seeded ${categoryCount} categories`)
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
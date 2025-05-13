import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function seedReviews() {
  const products = await prisma.product.findMany({ select: { id: true } })
  const users = await prisma.user.findMany({ select: { id: true } })

  let totalReviews = 0

  for (const product of products) {
    const reviewCount = faker.number.int({ min: 0, max: 53 })

    const reviews = Array.from({ length: reviewCount }).map(() => ({
      rating: faker.number.int({ min: 0.5, max: 5 }),
      text: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
      productId: product.id,
      userId: faker.helpers.arrayElement(users).id,
    }))

    if (reviews.length) {
      await prisma.review.createMany({ data: reviews })
      totalReviews += reviews.length
    }
  }

  return totalReviews
}

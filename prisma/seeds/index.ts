import { PrismaClient } from '@prisma/client'
import seedCategories from "./categories.seed"

const prisma = new PrismaClient()

async function main() {
	await seedCategories()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
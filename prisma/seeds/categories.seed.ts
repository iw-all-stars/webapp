import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default async function seedCategories() {

  const categoriesNames = [
    "Africain",
    "Américain",
    "Asiatique",
    "Bio",
    "Burger",
    "Chinois",
    "Coréen",
    "Cuisine du monde",
    "Espagnol",
    "Français",
    "Grec",
    "Indien",
    "Italien",
    "Japonais",
    "Libanais",
    "Marocain",
    "Mexicain",
    "Haïtien",
    "Sushi",
    "Thaïlandais",
    "Turc",
    "Végétarien",
    "Vietnamien",
  ];

  const seedCategories = await prisma.category.createMany({
    data: categoriesNames.map((name) => ({
      name 
    })),
  });

	console.log({ seedCategories });


//	prisma.client.deleteMany({}).then(() => {
//		console.log("All clients deleted");
//	prisma.$disconnect();
//  }
//  ).catch((err) => {
//		console.log(err);
//	prisma.$disconnect();
//  }
//  );
}
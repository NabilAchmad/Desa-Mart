const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cats = [
    'Sayur & Buah Segar',
    'Madu & Rempah',
    'Jajanan & Cemilan',
    'Kerajinan Tangan',
    'Tanaman Hias',
    'Pakaian & Fashion',
    'Aksesoris & Perhiasan',
    'Bahan Pokok & Sembako',
    'Daging & Ikan',
    'Peralatan Rumah Tangga',
    'Kopi, Teh & Minuman',
    'Kesehatan & Herbal Tradisional',
    'Produk Olahraga'
  ];

  for (const cat of cats) {
    const exists = await prisma.category.findFirst({ where: { name: cat } });
    if (!exists) {
      await prisma.category.create({ data: { name: cat } });
    }
  }
  console.log('Categories updated!');
}

main().catch(console.error).finally(() => prisma.$disconnect());

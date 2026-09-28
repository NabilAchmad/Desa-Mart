import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Clean up old data in correct order
    await prisma.cartItem.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.store.deleteMany({});
    await prisma.village.deleteMany({});
    await prisma.user.deleteMany({});

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@desamart.com' },
      update: {},
      create: {
        name: 'Administrator Pusat',
        email: 'admin@desamart.com',
        password: hashedPassword,
        role: 'ADMIN',
        phone: '081234567890'
      }
    });

    const village = await prisma.village.create({
      data: {
        name: 'Desa Sukamaju',
        district: 'Cibiru',
        city: 'Bandung',
        province: 'Jawa Barat',
        headName: 'Bapak Sudarman',
        contactPhone: '081122334455',
        latitude: -6.914744,
        longitude: 107.609810,
        radiusMeters: 1500,
        status: 'APPROVED'
      }
    });

    const store1 = await prisma.store.create({
      data: { name: 'Tani Jaya Sukamaju', description: 'Pengepul hasil bumi segar.', ownerId: admin.id, villageId: village.id, latitude: -6.914744, longitude: 107.609810 }
    });
    
    // Create random user for second store
    const user2 = await prisma.user.create({
      data: { name: 'Ibu Ningsih', email: 'ningsih@desamart.com', password: hashedPassword, phone: '08555' }
    });
    const store2 = await prisma.store.create({
      data: { name: 'Kriya Ibu Ningsih', description: 'Kerajinan lokal.', ownerId: user2.id, villageId: village.id, latitude: -6.914744, longitude: 107.609810 }
    });

    // Categories
    const categories = [
      { name: 'Sayur & Buah Segar', icon: '🥬' },
      { name: 'Madu & Rempah', icon: '🍯' },
      { name: 'Jajanan & Cemilan', icon: '🍪' },
      { name: 'Kerajinan Tangan', icon: '🧺' },
      { name: 'Tanaman Hias', icon: '🪴' }
    ];

    const dbCats = await Promise.all(
      categories.map(c => prisma.category.create({ data: { name: c.name } }))
    );

    const getCatId = (name: string) => dbCats.find(c => c.name === name)!.id;

    const dummyProducts = [
      // Sayur & Buah
      { name: 'Tomat Ceri Hidroponik 500g', price: 15000, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', storeId: store1.id, categoryId: getCatId('Sayur & Buah Segar') },
      { name: 'Bayam Merah Organik', price: 6000, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', storeId: store1.id, categoryId: getCatId('Sayur & Buah Segar') },
      { name: 'Pisang Kepok Sisir', price: 20000, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', storeId: store1.id, categoryId: getCatId('Sayur & Buah Segar') },
      { name: 'Cabai Rawit Merah 250g', price: 25000, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1588017325514-9343ee0fb831?auto=format&fit=crop&w=600&q=80', storeId: store1.id, categoryId: getCatId('Sayur & Buah Segar') },
      
      // Madu & Rempah
      { name: 'Madu Hutan Liar 250ml', price: 85000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1587049352847-81a56d773c1c?auto=format&fit=crop&w=600&q=80', storeId: store1.id, categoryId: getCatId('Madu & Rempah') },
      { name: 'Jahe Merah Bubuk 100g', price: 35000, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&w=600&q=80', storeId: store1.id, categoryId: getCatId('Madu & Rempah') },
      { name: 'Kayu Manis Batang 50g', price: 12000, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=600&q=80', storeId: store1.id, categoryId: getCatId('Madu & Rempah') },
      
      // Jajanan
      { name: 'Keripik Pisang Kepok Manis', price: 15000, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1599599810141-8fccb2229550?auto=format&fit=crop&w=600&q=80', storeId: store2.id, categoryId: getCatId('Jajanan & Cemilan') },
      { name: 'Kue Ali Agrem Khas', price: 20000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1621345472856-f2daeb8008a6?auto=format&fit=crop&w=600&q=80', storeId: store2.id, categoryId: getCatId('Jajanan & Cemilan') },
      { name: 'Dodol Garut Asli', price: 30000, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1610444588998-0f04f057e0e7?auto=format&fit=crop&w=600&q=80', storeId: store2.id, categoryId: getCatId('Jajanan & Cemilan') },

      // Kerajinan
      { name: 'Keranjang Anyaman Bambu', price: 45000, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b14092285229?auto=format&fit=crop&w=600&q=80', storeId: store2.id, categoryId: getCatId('Kerajinan Tangan') },
      { name: 'Tikar Pandan Lebar', price: 120000, stock: 5, imageUrl: 'https://images.unsplash.com/photo-1596459345244-1234b673239a?auto=format&fit=crop&w=600&q=80', storeId: store2.id, categoryId: getCatId('Kerajinan Tangan') },
      { name: 'Tas Rajut Gembok', price: 85000, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1616421063212-706f9d78079a?auto=format&fit=crop&w=600&q=80', storeId: store2.id, categoryId: getCatId('Kerajinan Tangan') },

      // Tanaman Hias
      { name: 'Monstera Deliciosa Mini', price: 55000, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80', storeId: store1.id, categoryId: getCatId('Tanaman Hias') },
      { name: 'Kaktus Hias Meja', price: 25000, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1554902174-88484a0d9230?auto=format&fit=crop&w=600&q=80', storeId: store1.id, categoryId: getCatId('Tanaman Hias') }
    ];

    await prisma.product.createMany({
      data: dummyProducts.map(p => ({
        ...p,
        description: 'Produk asli berkualitas tinggi, didatangkan langsung dari tangan warga.',
      }))
    });

    return NextResponse.json({ success: true, message: 'Massive dummy data generated!' });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

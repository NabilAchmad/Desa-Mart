import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import DashboardSidebar from '@/components/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role === 'ADMIN') redirect('/admin');

  const activeOrdersCount = await prisma.order.count({
    where: { userId: session.userId, status: { in: ['PENDING', 'SHIPPED'] } }
  });

  const store = await prisma.store.findUnique({ where: { ownerId: session.userId } });
  let incomingOrdersCount = 0;
  if (store) {
    incomingOrdersCount = await prisma.order.count({
      where: {
        status: 'PENDING',
        items: { some: { product: { storeId: store.id } } }
      }
    });
  }

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '80vh', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
      
      {/* Sidebar / Tabs */}
      <DashboardSidebar activeOrdersCount={activeOrdersCount} incomingOrdersCount={incomingOrdersCount} />

      {/* Main Content Area */}
      <main style={{ flex: 3, minWidth: '300px' }}>
        {children}
      </main>
    </div>
  )
}

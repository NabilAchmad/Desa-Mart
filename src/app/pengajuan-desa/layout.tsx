import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function PengajuanDesaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  // Protect route from ADMIN
  if (session?.role === 'ADMIN') {
    redirect('/admin');
  }

  // Need to be logged in to register a village
  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
}

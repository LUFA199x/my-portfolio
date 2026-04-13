import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen bg-[#0d0d0c] flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

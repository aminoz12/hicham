import { Outlet } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';

export function AdminPage() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}


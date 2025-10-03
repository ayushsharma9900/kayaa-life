'use client';

import AdminLayout from '../../../components/admin/AdminLayout';
import MenuManager from '../../../components/admin/MenuManager';

export default function MenuManagementPage() {
  const handleAddItem = () => {
    alert('Add menu item functionality to be implemented.');
  };

  return (
    <AdminLayout title="Menu Management">
      <div className="max-w-7xl mx-auto space-y-6">
        <MenuManager onAddItem={handleAddItem} />
      </div>
    </AdminLayout>
  );
}
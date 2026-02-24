'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import AdminSidebar from './admin/AdminSidebar';
import EditorSidebar from './editor/EditorSidebar';

interface SidebarProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: SidebarProps) {
  const { data: session } = useSession();
  const role = session?.user?.role;
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar for admin/editor */}
      {role === 'admin' && <AdminSidebar />}
      {role === 'editor' && <EditorSidebar />}
      <main className="flex-1 flex flex-col px-4 py-6">
        {children}
      </main>
    </div>
  );
}

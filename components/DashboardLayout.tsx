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
  const isStaff = role === 'admin' || role === 'editor';
  return (
    <div className="flex min-h-[calc(100dvh-var(--site-header-height))] w-full min-w-0 flex-col bg-[#fafbfc] text-gray-900 lg:flex-row">
      {/* Sidebar for admin/editor */}
      {role === 'admin' && <AdminSidebar />}
      {role === 'editor' && <EditorSidebar />}
      <div className={`min-w-0 flex-1 ${isStaff ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
        {children}
      </div>
    </div>
  );
}

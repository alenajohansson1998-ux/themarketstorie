'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Users, Tags, ChartNoAxesCombined, Settings, Bot, ShieldCheck, Mail, Megaphone } from 'lucide-react';
import DashboardSidebar from '@/components/DashboardSidebar';
const adminLinks = [
  { label: 'Dashboard', icon: <LayoutDashboard />, href: '/admin' },
  { label: 'Posts', icon: <FileText />, href: '/admin/cms/posts' },
  { label: 'AI Articles', icon: <Bot />, href: '/admin/articles' },
  { label: 'Categories', icon: <Tags />, href: '/admin/cms/categories' },
  { label: 'Users', icon: <Users />, href: '/admin/users' },
  { label: 'Brokers', icon: <ShieldCheck />, href: '/admin/brokers/list', match: '/admin/brokers' },
  { label: 'Markets', icon: <ChartNoAxesCombined />, href: '/admin/markets' },
  { label: 'Contact Requests', icon: <Mail />, href: '/admin/contact-requests' },
  { label: 'Ad Enquiries', icon: <Megaphone />, href: '/admin/advertising-enquiries' },
  { label: 'Settings', icon: <Settings />, href: '/admin/settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname() || '/';
  return <DashboardSidebar title="Admin" items={adminLinks.map((item) => ({
    ...item,
    active: item.href === '/admin'
      ? pathname === '/admin' || pathname === '/dashboard'
      : pathname === (item.match || item.href) || pathname.startsWith(`${item.match || item.href}/`),
  }))} />;
}

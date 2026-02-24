import { Home, FileText, Plus, User, Settings, Bell, TrendingUp, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface UserDashboardSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function UserDashboardSidebar({ activeSection, setActiveSection }: UserDashboardSidebarProps) {
  const router = useRouter();
  return (
    <div className="w-64 bg-white text-black flex flex-col border-r border-gray-200 min-h-full">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                activeSection === 'dashboard'
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                activeSection === 'profile'
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <User className="h-5 w-5 mr-3" />
              Profile
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection('quick-actions')}
              className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                activeSection === 'quick-actions'
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <Settings className="h-5 w-5 mr-3" />
              Quick Actions
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection('recent-activity')}
              className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                activeSection === 'recent-activity'
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <Bell className="h-5 w-5 mr-3" />
              Recent Activity
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection('alerts-feed')}
              className={`w-full flex items-center px-4 py-2 text-left rounded-md ${
                activeSection === 'alerts-feed'
                  ? 'bg-gray-100 text-black'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <TrendingUp className="h-5 w-5 mr-3" />
              Alerts Feed
            </button>
          </li>
        </ul>
      </nav>
      <div className="px-4 py-6">
        <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-black rounded-md w-full">
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}

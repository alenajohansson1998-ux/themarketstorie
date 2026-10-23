
"use client";
import React, { useState } from "react";
import { FaHome, FaUser, FaCogs, FaBell, FaChartLine } from "react-icons/fa";
import DashboardSidebar from "@/components/DashboardSidebar";



const sidebarItems = [
  { label: "Dashboard", icon: <FaHome /> },
  { label: "Profile", icon: <FaUser /> },
  { label: "Quick Actions", icon: <FaCogs /> },
  { label: "Recent Activity", icon: <FaBell /> },
  { label: "Alerts Feed", icon: <FaChartLine /> },
];

const mockUser = {
  name: "Alena johansson",
  email: "alenajohansson1998@gmail.com",
};

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div className="flex min-h-[80vh] min-w-0 flex-col bg-[#fafbfc] lg:flex-row">
      {/* Sidebar */}
      <DashboardSidebar title="Dashboard" items={sidebarItems.map((item) => ({
        ...item,
        active: activeTab === item.label,
        onClick: () => setActiveTab(item.label),
      }))} />

      {/* Main Content */}
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Welcome back, {mockUser.name}!
        </h1>
        <p className="mb-8 text-sm text-gray-500 sm:text-base">
          Your personal dashboard for market insights and account management.
        </p>

        {activeTab === "Dashboard" && (
          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Alerts Feed</h2>
            <p style={{ color: "#666" }}>Your alerts feed will appear here.</p>
          </section>
        )}

        {activeTab === "Profile" && (
          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Profile</h2>
            <p>Name: {mockUser.name}</p>
            <p>Email: {mockUser.email}</p>
          </section>
        )}

        {activeTab === "Quick Actions" && (
          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Quick Actions</h2>
            <p>Quick actions will be available here.</p>
          </section>
        )}

        {activeTab === "Recent Activity" && (
          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Recent Activity</h2>
            <p>Your recent activity will be shown here.</p>
          </section>
        )}

        {activeTab === "Alerts Feed" && (
          <section>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Alerts Feed</h2>
            <p>Your alerts feed will appear here.</p>
          </section>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;


"use client";
import React, { useState } from "react";
import { FaHome, FaUser, FaCogs, FaBell, FaChartLine } from "react-icons/fa";



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
    <div style={{ display: "flex", minHeight: "80vh", background: "#fafbfc" }}>
      {/* Sidebar */}
      <aside style={{ width: 250, background: "#fff", height: "100vh", padding: 24, boxShadow: "2px 0 8px #f0f1f2" }}>
        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 32 }}>Dashboard</h2>
        <nav>
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 16px",
                borderRadius: 8,
                marginBottom: 8,
                color: activeTab === item.label ? "#222" : "#555",
                background: activeTab === item.label ? "#f5f6fa" : "transparent",
                fontWeight: 500,
                fontSize: 18,
                border: "none",
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              <span style={{ marginRight: 12, fontSize: 20 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "40px 48px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
          Welcome back, {mockUser.name}!
        </h1>
        <p style={{ fontSize: 18, color: "#555", marginBottom: 32 }}>
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
      </main>
    </div>
  );
};

export default UserDashboard;

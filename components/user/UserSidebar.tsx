"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { FaHome, FaUser, FaCogs, FaBell, FaChartLine, FaFileAlt, FaEdit } from "react-icons/fa";

const UserSidebar = () => {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const sidebarItems = [
    { label: "Dashboard", icon: <FaHome />, href: "/dashboard" },
    { label: "Profile", icon: <FaUser />, href: "/dashboard/profile" },
    { label: "Quick Actions", icon: <FaCogs />, href: "/dashboard/actions" },
    { label: "Recent Activity", icon: <FaBell />, href: "/dashboard/activity" },
    { label: "Alerts Feed", icon: <FaChartLine />, href: "/dashboard/alerts" },
  ];

  // Add post management for editor and admin
  if (role === "editor" || role === "admin") {
    sidebarItems.push(
      { label: "Create Post", icon: <FaEdit />, href: "/admin/cms/posts/new" },
      { label: "Manage Posts", icon: <FaFileAlt />, href: "/admin/cms/posts" }
    );
  }

  return (
    <aside style={{ width: 250, background: "#fff", height: "100vh", padding: 24, boxShadow: "2px 0 8px #f0f1f2" }}>
      <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 32 }}>Dashboard</h2>
      <nav>
        {sidebarItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 8,
              color: "#222",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: 18,
              transition: "background 0.2s",
            }}
            onMouseOver={e => (e.currentTarget.style.background = "#f5f6fa")}
            onMouseOut={e => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ marginRight: 12, fontSize: 20 }}>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default UserSidebar;

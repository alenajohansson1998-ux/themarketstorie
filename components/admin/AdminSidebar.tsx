import React from "react";
import { FaTachometerAlt, FaFileAlt, FaUsers, FaTags, FaChartBar, FaCog, FaRobot } from "react-icons/fa";
import Link from "next/link";

import { FaShieldAlt, FaEnvelope } from "react-icons/fa";
const adminLinks = [
  { label: "Dashboard", icon: <FaTachometerAlt />, href: "/admin" },
  { label: "Posts", icon: <FaFileAlt />, href: "/admin/cms/posts" },
  { label: "AI Articles", icon: <FaRobot />, href: "/admin/articles" },
  { label: "Categories", icon: <FaTags />, href: "/admin/cms/categories" },
  { label: "Users", icon: <FaUsers />, href: "/admin/users" },
  { label: "Brokers", icon: <FaShieldAlt />, href: "/admin/brokers/list" },
  { label: "Markets", icon: <FaChartBar />, href: "/admin/markets" },
  { label: "Contact Requests", icon: <FaEnvelope />, href: "/admin/contact-requests" },
  { label: "Settings", icon: <FaCog />, href: "/admin/settings" },
];

const AdminSidebar = () => (
  <aside style={{ width: 240, background: "#fff", height: "100vh", padding: 24, boxShadow: "2px 0 8px #f0f1f2" }}>
    <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 32 }}>Admin</h2>
    <nav>
      {adminLinks.map((item) => (
        <Link
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
            fontSize: 17,
            transition: "background 0.2s",
          }}
        >
          <span style={{ marginRight: 12, fontSize: 20 }}>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  </aside>
);

export default AdminSidebar;

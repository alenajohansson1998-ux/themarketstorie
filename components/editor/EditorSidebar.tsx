"use client";
import React from "react";
import { FaEdit, FaFileAlt, FaHome, FaUser, FaQuestionCircle, FaRobot } from "react-icons/fa";
import Link from "next/link";

const editorLinks = [
  { label: "Dashboard", icon: <FaHome />, href: "/dashboard" },
  { label: "Create Post", icon: <FaEdit />, href: "/editor/posts/new" },
  { label: "Manage Posts", icon: <FaFileAlt />, href: "/editor/posts" },
  { label: "AI Articles", icon: <FaRobot />, href: "/admin/articles" },
  { label: "Profile", icon: <FaUser />, href: "/editor/profile" },
  { label: "Help", icon: <FaQuestionCircle />, href: "/editor/help" },
];

const EditorSidebar = () => (
  <aside style={{ width: 240, background: "#fff", height: "100vh", padding: 24, boxShadow: "2px 0 8px #f0f1f2" }}>
    <h2 style={{ fontWeight: 700, fontSize: 26, marginBottom: 32 }}>Editor</h2>
    <nav>
      {editorLinks.map((item) => (
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

export default EditorSidebar;

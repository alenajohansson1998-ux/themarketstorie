"use client";
import React from "react";
import { FaEdit, FaFileAlt } from "react-icons/fa";
import EditorCredits from "./EditorCredits";

const EditorDashboard = () => {
  return (
    <div style={{ padding: 40 }}>
      <EditorCredits />
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>
        Welcome, Editor!
      </h1>
      <p style={{ fontSize: 18, color: "#555", marginBottom: 32 }}>
        You have access to create and manage posts.
      </p>
      <div style={{ display: "flex", gap: 24 }}>
        <a
          href="/editor/posts/new"
          style={{
            display: "flex",
            alignItems: "center",
            background: "#f5f6fa",
            padding: "20px 32px",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 20,
            color: "#222",
            textDecoration: "none",
            boxShadow: "0 2px 8px #f0f1f2",
          }}
        >
          <FaEdit style={{ marginRight: 16, fontSize: 28 }} />
          Create Post
        </a>
        <a
          href="/editor/posts"
          style={{
            display: "flex",
            alignItems: "center",
            background: "#f5f6fa",
            padding: "20px 32px",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 20,
            color: "#222",
            textDecoration: "none",
            boxShadow: "0 2px 8px #f0f1f2",
          }}
        >
          <FaFileAlt style={{ marginRight: 16, fontSize: 28 }} />
          Manage Posts
        </a>
      </div>
    </div>
  );
};

export default EditorDashboard;

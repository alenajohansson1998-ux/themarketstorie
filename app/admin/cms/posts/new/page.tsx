"use client";
import React from "react";
import dynamic from "next/dynamic";

// If you have a post creation form component, import it here
// import PostCreateForm from "@/components/CMS/PostCreateForm";

const NewPostPage = () => {
  return (
    <div style={{ maxWidth: 800, margin: "40px auto", background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 2px 8px #f0f1f2" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Create New Post</h1>
      {/* Replace below with your actual post creation form */}
      <p>This is the new post creation page. Add your post creation form here.</p>
      {/* <PostCreateForm /> */}
    </div>
  );
};

export default NewPostPage;

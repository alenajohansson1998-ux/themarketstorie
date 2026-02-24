"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function EditorCredits() {
  const { data: session, status } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch(`/api/user/credits`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setCredits(data.credits);
          else setError(data.error || "Failed to fetch credits");
        })
        .catch(() => setError("Failed to fetch credits"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [status, session]);

  if (loading) return <div>Loading credits...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div style={{ marginBottom: 24, padding: 16, background: "#f5f6fa", borderRadius: 8, fontSize: 18 }}>
      <b>Post Credits:</b> {credits}
      <button style={{ marginLeft: 16, padding: "6px 18px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}
        onClick={() => alert('Purchase flow coming soon!')}
      >
        Purchase More
      </button>
    </div>
  );
}

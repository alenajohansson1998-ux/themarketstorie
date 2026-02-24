"use client";
import { useSession } from "next-auth/react";

export default function EditorProfilePage() {
  const { data: session, status } = useSession();
  if (status === "loading") return <div className="p-8">Loading...</div>;
  if (!session) return <div className="p-8 text-red-600">Not logged in</div>;
  const user = session.user;
  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <span className="font-semibold">Name:</span> {user.name}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Email:</span> {user.email}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Role:</span> {user.role}
        </div>
        {/* Add more profile fields or edit functionality as needed */}
      </div>
    </div>
  );
}

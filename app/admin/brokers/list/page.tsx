"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Broker {
  _id: string;
  name: string;
  logoUrl: string;
  banner?: string;
  rating: number;
  ratingText: string;
  assets: string;
  reviews: number;
  accounts: string;
  badge?: string;
  website?: string;
}

export default function AdminBrokersListPage() {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/brokers")
      .then((res) => res.json())
      .then((data) => {
        setBrokers(data.brokers || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load brokers");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this broker?")) return;
    try {
      const res = await fetch(`/api/admin/brokers?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete broker");
      setBrokers((prev) => prev.filter((b) => b._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  if (loading) return <div>Loading brokers...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="w-full p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Brokers List</h1>
        <Link href="/admin/brokers" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition">
          Add New Broker
        </Link>
      </div>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left">Logo</th>
            <th className="py-2 px-4 text-left">Banner</th>
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Rating</th>
            <th className="py-2 px-4 text-left">Assets</th>
            <th className="py-2 px-4 text-left">Accounts</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {brokers.map((broker) => (
            <tr key={broker._id} className="border-t">
              <td className="py-2 px-4">
                <img src={broker.logoUrl} alt={broker.name} className="h-8 w-8 object-contain" />
              </td>
              <td className="py-2 px-4">
                {broker.banner ? (
                  <img src={broker.banner} alt={broker.name + ' banner'} className="h-8 w-20 object-cover rounded" />
                ) : (
                  <span className="text-xs text-gray-400">No Banner</span>
                )}
              </td>
              <td className="py-2 px-4 font-semibold">{broker.name}</td>
              <td className="py-2 px-4">{broker.rating} <span className="text-xs text-gray-500">{broker.ratingText}</span></td>
              <td className="py-2 px-4">{broker.assets}</td>
              <td className="py-2 px-4">{broker.accounts}</td>
              <td className="py-2 px-4 flex gap-2">
                <Link href={`/admin/brokers/edit/${broker._id}`} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">Edit</Link>
                <button onClick={() => handleDelete(broker._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

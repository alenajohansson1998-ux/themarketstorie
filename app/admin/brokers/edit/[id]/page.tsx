
import React from "react";
import { notFound } from "next/navigation";
import AdminBrokerForm from '@/components/AdminBrokerForm';

export default async function EditBrokerPage(props: { params: Promise<{ id?: string }> }) {
  const { id } = await props.params;
  if (!id || id === "undefined") {
    return (
      <div className="max-w-2xl mx-auto p-6 text-red-600 font-semibold">
        Invalid broker ID. Please return to the brokers list and try again.
      </div>
    );
  }
  // Fetch broker data by ID
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/admin/brokers?id=${id}`, { cache: 'no-store' });
  if (!res.ok) return notFound();
  const data = await res.json();
  const broker = data.broker;
  if (!broker) return notFound();

  // Map broker fields to form state (convert numbers to strings for form fields)
  const initialValues = {
    ...broker,
    rating: broker.rating?.toString() ?? '',
    reviews: broker.reviews?.toString() ?? '',
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Broker</h1>
      <div className="bg-white p-4 rounded shadow">
        <AdminBrokerForm initialValues={initialValues} mode="edit" brokerId={id} />
      </div>
    </div>
  );
}

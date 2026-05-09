"use client";
import React from "react";

type Enquiry = {
  _id: string;
  name: string;
  company: string;
  email: string;
  format: string;
  message: string;
  status: "new" | "reviewed";
  createdAt: string;
};

export default function AdvertisingEnquiriesPage() {
  const [enquiries, setEnquiries] = React.useState<Enquiry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/advertising-enquiry")
      .then((r) => r.json())
      .then((data) => { setEnquiries(data); setLoading(false); });
  }, []);

  async function markReviewed(id: string) {
    await fetch("/api/advertising-enquiry", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "reviewed" }),
    });
    setEnquiries((prev) =>
      prev.map((e) => (e._id === id ? { ...e, status: "reviewed" } : e))
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertising Enquiries</h1>
          <p className="text-gray-500 text-sm mt-1">Submissions from the advertise page contact form.</p>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            {enquiries.filter((e) => e.status === "new").length} New
          </span>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
            {enquiries.length} Total
          </span>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : enquiries.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-16 text-center text-gray-400">
          No advertising enquiries yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Company</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Format</th>
                <th className="px-5 py-3 text-left">Message</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enquiries.map((e) => (
                <tr key={e._id} className={e.status === "new" ? "bg-blue-50/40" : ""}>
                  <td className="px-5 py-4 font-medium text-gray-900 whitespace-nowrap">{e.name}</td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{e.company || "—"}</td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                    <a href={`mailto:${e.email}`} className="text-blue-600 hover:underline">{e.email}</a>
                  </td>
                  <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{e.format || "—"}</td>
                  <td className="px-5 py-4 text-gray-600 max-w-xs truncate" title={e.message}>{e.message}</td>
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                    {new Date(e.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {e.status === "new" ? (
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">New</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Reviewed</span>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {e.status === "new" && (
                      <button
                        onClick={() => markReviewed(e._id)}
                        className="text-xs bg-gray-900 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Mark Reviewed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

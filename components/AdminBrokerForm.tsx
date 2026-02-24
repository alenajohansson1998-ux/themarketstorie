"use client";
import React, { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface BrokerFormState {
  name: string;
  slug: string;
  rating: string;
  ratingText: string;
  assets: string;
  reviews: string;
  accounts: string;
  badge: string;
  description: string;
  logo?: File | null;
  logoUrl: string;
  banner?: File | null;
  bannerUrl: string;
  regulator?: string;
  website?: string;
  phone?: string;
  address?: string;
  terms?: string;
  features?: string;
  faq: FAQItem[];
}

const initialState: BrokerFormState = {
  name: "",
  slug: "",
  rating: "",
  ratingText: "",
  assets: "",
  reviews: "",
  accounts: "",
  badge: "",
  description: "",
  logo: null,
  logoUrl: "",
  banner: null,
  bannerUrl: "",
  regulator: "",
  website: "",
  phone: "",
  address: "",
  terms: "",
  features: "",
  faq: [ { question: "", answer: "" } ],
};

interface AdminBrokerFormProps {
  initialValues?: Partial<BrokerFormState>;
  mode?: 'add' | 'edit';
  brokerId?: string;
}

export default function AdminBrokerForm({ initialValues, mode = 'add', brokerId }: AdminBrokerFormProps) {
  // Local input style for all text boxes
  const inputStyle = "px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 w-full";
  const [form, setForm] = useState<BrokerFormState>({ ...initialState, ...initialValues });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if ((name === "logo" || name === "banner") && "files" in e.target && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm((f) => ({ ...f, [name]: file }));
      // Upload to Cloudinary
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "backlinkfusion");
      setLoading(true);
      try {
        const res = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_URL || "https://api.cloudinary.com/v1_1/drwlimidd/image/upload", {
          method: "POST",
          body: data,
        });
        const result = await res.json();
        if (result.secure_url) {
          if (name === "logo") {
            setForm((f) => ({ ...f, logoUrl: result.secure_url }));
          } else if (name === "banner") {
            setForm((f) => ({ ...f, bannerUrl: result.secure_url }));
          }
        }
      } catch (err) {
        setError("Image upload failed");
      } finally {
        setLoading(false);
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // FAQ handlers
  const handleFaqChange = (idx: number, field: 'question' | 'answer', value: string) => {
    setForm((f) => ({
      ...f,
      faq: f.faq.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    }));
  };

  const handleAddFaq = () => {
    setForm((f) => ({ ...f, faq: [...f.faq, { question: '', answer: '' }] }));
  };

  const handleRemoveFaq = (idx: number) => {
    setForm((f) => ({ ...f, faq: f.faq.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const payload = { ...form };
      // Use Cloudinary URLs if available
      if (form.logoUrl) {
        payload.logoUrl = form.logoUrl;
      }
      if (form.bannerUrl) {
        payload.bannerUrl = form.bannerUrl;
      }
      // Remove file objects from payload
      if ('logo' in payload) {
        delete (payload as any).logo;
      }
      if ('banner' in payload) {
        delete (payload as any).banner;
      }
      // Debug: log payload before sending
      if (typeof window !== 'undefined') {
        console.log('[AdminBrokerForm] Submitting payload:', payload);
      }
      let res;
      if (mode === 'edit' && brokerId) {
        if (!window.confirm("Are you sure you want to update this broker?")) {
          setLoading(false);
          return;
        }
        res = await fetch(`/api/admin/brokers?id=${brokerId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        if (!window.confirm("Are you sure you want to add this broker?")) {
          setLoading(false);
          return;
        }
        res = await fetch("/api/admin/brokers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) throw new Error(mode === 'edit' ? "Failed to update broker" : "Failed to upload broker");
      setSuccess(true);
      if (mode === 'add') setForm(initialState);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full max-w-7xl mx-auto p-8" onSubmit={handleSubmit}>
      <div className="w-full">
        {/* Basic Information */}
        <h2 className="text-xl font-semibold mb-2">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border-b pb-6">
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-4 font-medium text-right pr-2" htmlFor="name">Broker Name :</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} className={inputStyle + " col-span-8"} required />
          </div>
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-4 font-medium text-right pr-2" htmlFor="slug">Slug :</label>
            <input id="slug" name="slug" value={form.slug ?? ""} onChange={handleChange} className={inputStyle + " col-span-8"} required placeholder="e.g. interactive-brokers" />
          </div>
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-4 font-medium text-right pr-2" htmlFor="rating">Rating :</label>
            <input id="rating" name="rating" value={form.rating} onChange={handleChange} type="number" step="0.1" min="0" max="5" className={inputStyle + " col-span-8"} required />
          </div>
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-4 font-medium text-right pr-2" htmlFor="ratingText">Rating Text :</label>
            <input id="ratingText" name="ratingText" value={form.ratingText} onChange={handleChange} className={inputStyle + " col-span-8"} required />
          </div>
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-4 font-medium text-right pr-2" htmlFor="badge">Badge :</label>
            <input id="badge" name="badge" value={form.badge} onChange={handleChange} className={inputStyle + " col-span-8"} placeholder="PLATINUM/GOLD" />
          </div>
        </div>

        {/* Broker Statistics */}
        <h2 className="text-xl font-semibold mb-2">Broker Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 border-b pb-6">
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-5 font-medium text-right pr-2" htmlFor="assets">Tradable Assets :</label>
            <input id="assets" name="assets" value={form.assets} onChange={handleChange} className={inputStyle + " col-span-7"} required />
          </div>
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-5 font-medium text-right pr-2" htmlFor="reviews">Reviews :</label>
            <input id="reviews" name="reviews" value={form.reviews} onChange={handleChange} className={inputStyle + " col-span-7"} required />
          </div>
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-5 font-medium text-right pr-2" htmlFor="accounts">Accounts :</label>
            <input id="accounts" name="accounts" value={form.accounts} onChange={handleChange} className={inputStyle + " col-span-7"} required />
          </div>
        </div>

        {/* Company & Regulation */}
        <h2 className="text-xl font-semibold mb-2">Company & Regulation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border-b pb-6">
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-5 font-medium text-right pr-2" htmlFor="regulator">Regulator :</label>
            <input id="regulator" name="regulator" value={form.regulator} onChange={handleChange} className={inputStyle + " col-span-7"} />
          </div>
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-5 font-medium text-right pr-2" htmlFor="website">Website :</label>
            <input id="website" name="website" value={form.website} onChange={handleChange} className={inputStyle + " col-span-7"} />
          </div>
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-5 font-medium text-right pr-2" htmlFor="phone">Phone :</label>
            <input id="phone" name="phone" value={form.phone} onChange={handleChange} className={inputStyle + " col-span-7"} />
          </div>
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-5 font-medium text-right pr-2" htmlFor="address">Address :</label>
            <input id="address" name="address" value={form.address} onChange={handleChange} className={inputStyle + " col-span-7"} />
          </div>
        </div>

        {/* Description */}
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <div className="mb-6 border-b pb-6">
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-2 font-medium text-right pr-2" htmlFor="description">Description :</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} className={inputStyle + " col-span-10 min-h-20"} />
          </div>
        </div>

        {/* Additional Details */}
        <h2 className="text-xl font-semibold mb-2">Additional Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border-b pb-6">
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-5 font-medium text-right pr-2" htmlFor="terms">Terms & Fees :</label>
            <textarea id="terms" name="terms" value={form.terms} onChange={handleChange} className={inputStyle + " col-span-7 min-h-[60px]"} />
          </div>
          <div className="grid grid-cols-12 items-center gap-2">
            <label className="col-span-5 font-medium text-right pr-2" htmlFor="features">Features :</label>
            <input id="features" name="features" value={form.features} onChange={handleChange} className={inputStyle + " col-span-7"} placeholder="Comma separated or tags" />
          </div>
        </div>

        <div className="mb-6 border-b pb-6">
          <label className="block font-medium mb-2 text-right pr-2">FAQ (Q/A format) :</label>
          {(Array.isArray(form.faq) ? form.faq : initialState.faq).map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center mb-2">
              <input
                className={inputStyle + " col-span-5"}
                placeholder="Question"
                value={item.question}
                onChange={e => handleFaqChange(idx, 'question', e.target.value)}
              />
              <input
                className={inputStyle + " col-span-5"}
                placeholder="Answer"
                value={item.answer}
                onChange={e => handleFaqChange(idx, 'answer', e.target.value)}
              />
              <button
                type="button"
                className="col-span-1 bg-red-100 hover:bg-red-200 text-red-600 rounded px-2 py-1 ml-2"
                onClick={() => handleRemoveFaq(idx)}
                disabled={form.faq.length === 1}
                title="Remove"
              >
                -
              </button>
              {idx === form.faq.length - 1 && (
                <button
                  type="button"
                  className="col-span-1 bg-green-100 hover:bg-green-200 text-green-600 rounded px-2 py-1 ml-2"
                  onClick={handleAddFaq}
                  title="Add FAQ"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Media & Action */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-6">
          <div className="grid grid-cols-12 items-center gap-2 w-full md:w-1/2">
            <label className="col-span-5 font-medium text-right pr-2" htmlFor="logo">Broker Logo :</label>
            <input id="logo" name="logo" type="file" accept="image/*" onChange={handleChange} className={inputStyle + " col-span-7"} />
          </div>
          <div className="grid grid-cols-12 items-center gap-2 w-full md:w-1/2 mt-4 md:mt-0">
            <label className="col-span-5 font-medium text-right pr-2" htmlFor="banner">Banner Image :</label>
            <input id="banner" name="banner" type="file" accept="image/*" onChange={handleChange} className={inputStyle + " col-span-7 mb-2"} />
            <input
              id="bannerUrl"
              name="bannerUrl"
              type="text"
              value={form.bannerUrl}
              onChange={handleChange}
              className={inputStyle + " col-span-12 mt-2"}
              placeholder="Paste banner image URL here (optional)"
            />
          </div>
          {form.bannerUrl && (
            <div className="col-span-12 flex justify-end mt-2">
              <img src={form.bannerUrl} alt="Banner Preview" className="h-16 w-auto rounded shadow border" />
            </div>
          )}
        </div>
      </div>
      <button type="submit" className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-3 rounded-lg transition" disabled={loading}>
        {loading ? (mode === 'edit' ? "Updating..." : "Uploading...") : (mode === 'edit' ? "Update Broker" : "Add Broker")}
      </button>
      {success && <div className="mt-4 text-green-600 font-medium">{mode === 'edit' ? 'Broker updated successfully!' : 'Broker added successfully!'}</div>}
      {error && <div className="mt-4 text-red-600 font-medium">{error}</div>}
    </form>
  );
}

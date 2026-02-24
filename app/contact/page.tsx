"use client";
import React from 'react';

export default function ContactPage() {
  // Contact form state and handler
  const [form, setForm] = React.useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try { 
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Your message has been sent!');
        setForm({ name: '', email: '', message: '' });
      } else {
        setError(data.error || 'Failed to send message.');
      }
    } catch {
      setError('Failed to send message.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              At <strong>TheMarketStories</strong>, we believe clear communication builds trust. Our team is committed to supporting readers, contributors, advertisers, and partners with timely and reliable assistance. Whether you have a question about our market coverage, need help with your account, or want to explore collaboration opportunities, we encourage you to get in touch using the relevant contact options below. Every message is reviewed by the appropriate team to ensure an accurate and prompt response.
            </p>
            <div className="flex flex-col gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">General Inquiries</h2>
                <p className="text-gray-600 mb-4">
                  For all general questions related to TheMarketStories, including website navigation, content access, editorial policies, or partnership discussions, our general inquiries team is ready to assist. This channel is best suited for readers and businesses who need information about our platform, coverage areas, or services.
                </p>
                <p className="text-gray-600 mb-2">We value every inquiry and aim to provide clear, helpful responses. Our team carefully reviews each message to ensure your concerns are addressed by the right department.</p>
                <div className="space-y-2">
                  <p className="text-gray-600"><strong>Email:</strong> support@themarketstories.com</p>
                  <p className="text-gray-600"><strong>Phone:</strong> +1 (437) 800-2303</p>
                  <p className="text-gray-600"><strong>Hours:</strong> Monday – Friday, 9:00 AM – 6:00 PM (EST)</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Advertising & Partnerships</h2>
                <p className="text-gray-600 mb-4">
                  TheMarketStories offers premium advertising and brand partnership opportunities designed to help businesses reach a financially engaged and market-focused audience. Our advertising solutions include sponsored articles, native content, banner placements, newsletter promotions, and long-term brand collaborations tailored to your campaign goals.
                </p>
                <p className="text-gray-600 mb-2">We work closely with advertisers to maintain transparency, editorial integrity, and performance-driven results.</p>
                <div className="space-y-2">
                  <p className="text-gray-600"><strong>Email:</strong> support@themarketstories.com</p>
                  <p className="text-gray-600"><strong>Phone:</strong> +1 (437) 800-2303</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Author & Contributor Accounts</h2>
                <p className="text-gray-600 mb-4">
                  We actively collaborate with experienced writers, analysts, and industry experts who wish to contribute high-quality financial, market, crypto, and business content. Approved authors receive access to a dedicated contributor dashboard, editorial support, and exposure to a global audience.
                </p>
                <p className="text-gray-600 mb-2">To apply for an Author Account, please submit your professional details along with writing samples. Our editorial team evaluates submissions for accuracy, originality, and subject-matter expertise.</p>
                <div className="space-y-2">
                  <p className="text-gray-600"><strong>Email:</strong> support@themarketstories.com</p>
                  <p className="text-gray-600"><strong>Please include:</strong></p>
                  <ul className="list-disc list-inside text-gray-600">
                    <li>Your full name and professional background</li>
                    <li>Areas of expertise or preferred topics</li>
                    <li>Links to published work or portfolio</li>
                    <li>Any relevant certifications or experience</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technical Support</h2>
                <p className="text-gray-600 mb-4">
                  Our technical support team is dedicated to ensuring a smooth and secure experience on TheMarketStories. If you encounter issues related to account access, subscriptions, technical errors, or platform performance, we encourage you to reach out immediately.
                </p>
                <p className="text-gray-600 mb-2">We prioritize resolving technical concerns efficiently to minimize disruption and improve overall user experience.</p>
                <div className="space-y-2">
                  <p className="text-gray-600"><strong>Email:</strong> support@themarketstories.com</p>
                  <p className="text-gray-600"><strong>Phone:</strong> +1 (437) 800-2303</p>
                  <p className="text-gray-600"><strong>Live Chat:</strong> Available during business hours for real-time assistance</p>
                  <p className="text-gray-600 text-xs">For faster resolution, please provide your registered email address and a brief description of the issue.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Media & Press</h2>
                <p className="text-gray-600 mb-4">
                  For journalists, media outlets, and organizations seeking official statements, interviews, or press materials related to TheMarketStories, our media relations team is available to assist. We welcome opportunities for media coverage, expert commentary, and strategic media collaborations.
                </p>
                <div className="space-y-2">
                  <p className="text-gray-600"><strong>Email:</strong> support@themarketstories.com</p>
                  <p className="text-gray-600"><strong>Phone:</strong> +1 (437) 800-2303</p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Office Location</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Headquarters</h3>
                  <address className="text-gray-600 not-italic">
                    Phoenix Creative Group<br />
                    123 Financial District<br />
                    New York, NY 10004<br />
                    United States
                  </address>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Business Hours</h3>
                  <div className="text-gray-600 space-y-1">
                    <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM EST</p>
                    <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM EST</p>
                    <p><strong>Sunday:</strong> Closed</p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Send Us a Message</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <p className="text-gray-600 mb-4">
                For detailed inquiries or feedback, please use the contact form below. We typically respond within 24-48 hours during business days.
              </p>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                  />
                </div>
                {success && <p className="text-green-600 text-sm">{success}</p>}
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Follow Us</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <p className="text-gray-600 mb-4">
                Stay connected with Phoenix Creative Group on social media for the latest news and updates:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <a href="https://www.facebook.com/profile.php?id=61586298068930" target="_blank" rel="noopener noreferrer">
                    <div className="bg-blue-600 text-white p-3 rounded-lg mb-2 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                        <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.405 24 24 23.408 24 22.674V1.326C24 .592 23.405 0 22.675 0" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">Facebook</p>
                    <p className="text-xs text-gray-500">@The Market Stories</p>
                  </a>
                </div>
                <div className="text-center">
                  <a href="https://x.com/MarketStorie" target="_blank" rel="noopener noreferrer">
                    <div className="bg-blue-400 text-white p-3 rounded-lg mb-2 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                        <path d="M17.53 3.5h3.97l-8.62 9.86 10.18 13.14h-8.02l-6.29-8.13-7.2 8.13H.03l9.22-10.56L0 3.5h8.19l5.77 7.47zm-1.14 17.13h2.2L6.62 5.13h-2.2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">X (Twitter)</p>
                    <p className="text-xs text-gray-500">@MarketStorie</p>
                  </a>
                </div>
                <div className="text-center">
                  <a href="https://www.instagram.com/the_market_stories/" target="_blank" rel="noopener noreferrer">
                    <div className="bg-pink-600 text-white p-3 rounded-lg mb-2 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.363 3.678 1.344c-.98.98-1.213 2.092-1.272 3.374C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.612.059 1.282.292 2.394 1.272 3.374.98.98 2.092 1.213 3.374 1.272C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.059 2.394-.292 3.374-1.272.98-.98 1.213-2.092 1.272-3.374.059-1.28.072-1.689.072-7.612 0-5.923-.013-6.332-.072-7.612-.059-1.282-.292-2.394-1.272-3.374-.98-.98-2.092-1.213-3.374-1.272C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">Instagram</p>
                    <p className="text-xs text-gray-500">@the_market_stories</p>
                  </a>
                </div>
                <div className="text-center">
                  <a href="https://www.youtube.com/@The_Market_Stories" target="_blank" rel="noopener noreferrer">
                    <div className="bg-red-600 text-white p-3 rounded-lg mb-2 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                        <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.633 3.5 12 3.5 12 3.5s-7.633 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 7.94 0 12 0 12s0 4.06.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.367 20.5 12 20.5 12 20.5s7.633 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 16.06 24 12 24 12s0-4.06-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">YouTube</p>
                    <p className="text-xs text-gray-500">The Market Stories</p>
                  </a>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Response Times</h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Expected Response Times:</strong>
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                    <li>General inquiries: Within 24 hours</li>
                    <li>Technical support: Within 12 hours</li>
                    <li>Advertising inquiries: Within 24-48 hours</li>
                    <li>Media requests: Within 48 hours</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mt-8">
              Thank you for choosing Phoenix Creative Group. We look forward to hearing from you!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

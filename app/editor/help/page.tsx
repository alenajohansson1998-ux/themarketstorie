"use client";

export default function EditorHelpPage() {
  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Editor Help</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2">How can we help you?</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>To create a post, click "Create Post" in the sidebar.</li>
          <li>To manage your posts, click "Manage Posts".</li>
          <li>Check your post credits at the top of the dashboard.</li>
          <li>Contact support at <a href="mailto:support@themarketstories.com" className="text-blue-600 underline">support@themarketstories.com</a></li>
        </ul>
        <p className="text-gray-600">For more help, reach out to your admin or visit our documentation.</p>
      </div>
    </div>
  );
}

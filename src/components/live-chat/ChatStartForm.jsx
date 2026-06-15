import { useState } from 'react';
import { MessageSquare } from 'lucide-react';

const categories = [
  'Account Issue',
  'Billing',
  'Technical Support',
  'General Inquiry',
  'Other'
];

export default function ChatStartForm({ onStartChat, isLoading, isConnected, error }) {
  const [formData, setFormData] = useState({
    customerFullName: '',
    category: 'Account Issue',
    briefDescription: ''
  });

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onStartChat(formData);
  }

  const buttonText = !isConnected ? 'Connecting...' : isLoading ? 'Starting...' : 'Start Chat';

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col bg-slate-50 p-5">
      <div className="mb-4">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
          <MessageSquare className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">Start Live Support</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Share a few details so we can route your chat correctly.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Customer Full Name</span>
          <input
            type="text"
            value={formData.customerFullName}
            onChange={(event) => updateField('customerFullName', event.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Mg Mg"
            autoComplete="name"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Category</span>
          <select
            value={formData.category}
            onChange={(event) => updateField('category', event.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-hidden transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Brief Description</span>
          <textarea
            rows={4}
            value={formData.briefDescription}
            onChange={(event) => updateField('briefDescription', event.target.value)}
            className="block w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-900 outline-hidden transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="I cannot login to my account"
          />
        </label>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!isConnected || isLoading}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {buttonText}
      </button>
    </form>
  );
}

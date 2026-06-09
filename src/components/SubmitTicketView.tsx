import React, { useState } from 'react';
import { AlertCircle, Check, Copy, FileText, ShieldAlert } from 'lucide-react';
import { createSupportTicket } from '../lib/api';

interface SubmitTicketViewProps {
  onNavigate: (route: string) => void;
  customerName: string;
}

const categories = [
  'Billing',
  'Account Issue',
  'Technical Support',
  'Security Concern',
  'General Inquiry',
  'Other'
];

export default function SubmitTicketView({
  onNavigate,
  customerName
}: SubmitTicketViewProps) {
  const [formData, setFormData] = useState({
    customerFullName: customerName,
    category: 'Billing',
    priority: 'medium',
    subject: '',
    description: ''
  });
  const [trackingCode, setTrackingCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  function updateField(field: string, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await createSupportTicket(formData);
      setTrackingCode(result.trackingCode);
      localStorage.setItem('latestSupportTicketCode', result.trackingCode);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to submit support ticket.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyTrackingCode() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(trackingCode);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = trackingCode;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Copy failed. Select the tracking code and copy it manually.');
    }
  }

  if (trackingCode) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-100 bg-white p-7 text-center shadow-sm fade-in-el">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-xl font-semibold text-slate-900">
          Ticket submitted
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          Save this tracking code. It is required to view future ticket updates.
        </p>

        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <span className="block text-[10px] font-semibold uppercase text-blue-500">
            Tracking code
          </span>
          <span className="mt-1 block font-mono text-xl font-bold text-slate-900">
            {trackingCode}
          </span>
          <button
            type="button"
            onClick={copyTrackingCode}
            className="mx-auto mt-3 flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied' : 'Copy code'}</span>
          </button>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => onNavigate('/customer')}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Help Center
          </button>
          <button
            type="button"
            onClick={() => onNavigate(`/customer/tickets/${trackingCode}`)}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Track Ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7 font-sans fade-in-el">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">
          Submit a Support Ticket
        </h1>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">
          Describe the issue and keep the tracking code shown after submission.
          No email address is required.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-700">
              Customer Full Name *
            </span>
            <input
              required
              maxLength={100}
              value={formData.customerFullName}
              onChange={(event) => updateField('customerFullName', event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-xs outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-700">
              Category *
            </span>
            <select
              value={formData.category}
              onChange={(event) => updateField('category', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-700">
              Priority *
            </span>
            <select
              value={formData.priority}
              onChange={(event) => updateField('priority', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">Subject *</span>
          <input
            required
            maxLength={150}
            value={formData.subject}
            onChange={(event) => updateField('subject', event.target.value)}
            placeholder="Double charge issue"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-xs outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Description *
          </span>
          <textarea
            required
            rows={7}
            maxLength={2000}
            value={formData.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="I was charged twice yesterday."
            className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-xs leading-relaxed outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          />
          <span className="mt-1 block text-right text-[10px] text-slate-400">
            {formData.description.length}/2000
          </span>
        </label>

        <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-[11px] text-amber-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Do not include passwords, full card numbers, private API keys, or other secrets.
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <FileText className="h-4 w-4" />
          <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
        </button>
      </form>
    </div>
  );
}

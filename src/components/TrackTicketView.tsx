import React, { useState } from 'react';
import { AlertCircle, Bookmark, Eye } from 'lucide-react';
import { trackSupportTicket } from '../lib/api';

interface TrackTicketViewProps {
  onNavigate: (route: string) => void;
}

export default function TrackTicketView({ onNavigate }: TrackTicketViewProps) {
  const [trackingCode, setTrackingCode] = useState(
    () => localStorage.getItem('latestSupportTicketCode') || ''
  );
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const ticket = await trackSupportTicket(trackingCode);
      localStorage.setItem('latestSupportTicketCode', ticket.trackingCode);
      onNavigate(`/customer/tickets/${ticket.trackingCode}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Unable to find ticket.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-7 font-sans fade-in-el">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">
          Track Your Ticket
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Enter the tracking code shown after ticket submission. No email address is needed.
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

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Tracking Code
          </span>
          <div className="relative">
            <Bookmark className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              required
              value={trackingCode}
              onChange={(event) => setTrackingCode(event.target.value.toUpperCase())}
              placeholder="TCK-8F3K2Q"
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3.5 font-mono text-sm uppercase outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Eye className="h-4 w-4" />
          <span>{isLoading ? 'Finding Ticket...' : 'View Ticket'}</span>
        </button>

        <p className="text-center text-[10px] leading-relaxed text-slate-400">
          The tracking code acts like a private link. Anyone with the code can view this
          ticket during the MVP.
        </p>
      </form>
    </div>
  );
}

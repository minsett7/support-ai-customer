import React, { useState } from 'react';
import { Ticket } from '../types';
import { Search, Eye, AlertCircle, Bookmark, Mail, HelpCircle } from 'lucide-react';

interface TrackTicketViewProps {
  tickets: Ticket[];
  onNavigate: (route: string) => void;
}

export default function TrackTicketView({ tickets, onNavigate }: TrackTicketViewProps) {
  const [email, setEmail] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !ticketId.trim()) {
      setErrorMsg('Please supply both your email address and Ticket ID.');
      return;
    }

    // Lookup
    const matchedTicket = tickets.find(
      (t) => t.id.toLowerCase() === ticketId.trim().toLowerCase()
    );

    if (!matchedTicket) {
      setErrorMsg('No support ticket found with that Ticket ID. Please verify your spelling.');
      return;
    }

    if (matchedTicket.customerEmail.toLowerCase() !== email.trim().toLowerCase()) {
      setErrorMsg("The email address provided does note match the author of this ticket.");
      return;
    }

    // Success! Redirect to details page
    onNavigate(`/customer/tickets/${matchedTicket.id}`);
  };

  const handleQuickLoad = (quickEmail: string, quickId: string) => {
    setEmail(quickEmail);
    setTicketId(quickId);
    setErrorMsg('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-sans fade-in-el" id="track-ticket-page">
      
      {/* Page Title */}
      <div>
        <h1 className="font-display font-semibold text-slate-900 text-2xl tracking-tight">
          Track Your Ticket
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-lg leading-relaxed">
          Enter the credentials associated with your support ticket to monitor review logs and speak with our specialists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side Lookup Form */}
        <div className="md:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-6">
          
          <form onSubmit={handleLookupSubmit} className="space-y-4">
            
            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-white text-xs pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all block"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Use the email address you used when submitting your ticket.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Bookmark className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="e.g. TCK-001"
                  className="w-full bg-white text-xs pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all block font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Eye className="h-4.5 w-4.5" />
              <span>Find Ticket</span>
            </button>

          </form>

        </div>

        {/* Right Side: Quick load info cards */}
        <div className="space-y-4">
          
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-3">
            <div className="flex items-center space-x-1.5 text-slate-800 text-xs font-semibold">
              <HelpCircle className="h-4.5 w-4.5 text-blue-500" />
              <span>Demo Quick-Load Card</span>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-relaxed">
              To make testing easier without inputting data, click a shortcut below to search for a preloaded mock ticket.
            </p>

            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => handleQuickLoad('john@example.com', 'TCK-001')}
                className="w-full text-left bg-white border border-slate-200 p-2 text-[10px] rounded-lg hover:border-blue-500 hover:bg-blue-50/20 font-bold block"
              >
                <div className="flex justify-between items-center text-slate-800">
                  <span>TCK-001 (Under Review)</span>
                  <span className="text-blue-600 font-normal">Apply</span>
                </div>
                <div className="text-slate-400 font-normal font-mono mt-0.5">Charged twice and...</div>
              </button>

              <button
                onClick={() => handleQuickLoad('john@example.com', 'TCK-002')}
                className="w-full text-left bg-white border border-slate-200 p-2 text-[10px] rounded-lg hover:border-blue-500 hover:bg-blue-50/20 font-bold block"
              >
                <div className="flex justify-between items-center text-slate-800">
                  <span>TCK-002 (Agent Replied)</span>
                  <span className="text-blue-600 font-normal">Apply</span>
                </div>
                <div className="text-slate-400 font-normal font-mono mt-0.5">Cannot log in...</div>
              </button>

              <button
                onClick={() => handleQuickLoad('john@example.com', 'TCK-003')}
                className="w-full text-left bg-white border border-slate-200 p-2 text-[10px] rounded-lg hover:border-blue-500 hover:bg-blue-50/20 font-bold block"
              >
                <div className="flex justify-between items-center text-slate-800">
                  <span>TCK-003 (Waiting Cust.)</span>
                  <span className="text-blue-600 font-normal">Apply</span>
                </div>
                <div className="text-slate-400 font-normal font-mono mt-0.5">API key not working...</div>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

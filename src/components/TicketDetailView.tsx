import React, { useState, useRef } from 'react';
import { Ticket, Message, TicketStatus } from '../types';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Paperclip, 
  Send, 
  X, 
  ShieldCheck, 
  FileText, 
  User, 
  Building,
  HelpCircle,
  ExternalLink,
  Info
} from 'lucide-react';

interface TicketDetailViewProps {
  ticketId: string;
  tickets: Ticket[];
  onReplyTicket: (ticketId: string, message: Message, nextStatus: TicketStatus) => void;
  onNavigate: (route: string) => void;
}

export default function TicketDetailView({
  ticketId,
  tickets,
  onReplyTicket,
  onNavigate
}: TicketDetailViewProps) {
  
  const ticket = tickets.find(t => t.id === ticketId);
  
  const [replyText, setReplyText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!ticket) {
    return (
      <div className="text-center py-16 space-y-4 font-sans fade-in-el" id="ticket-detail-error">
        <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h2 className="font-semibold text-slate-800 text-lg">Ticket Not Found</h2>
        <p className="text-xs text-slate-500 max-w-[280px] mx-auto">
          The requested ticket ID "{ticketId}" could not be matched with any ticket in our sandbox records.
        </p>
        <button
          onClick={() => onNavigate('/customer/track-ticket')}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl"
        >
          Return to Tracker
        </button>
      </div>
    );
  }

  // Determine current timeline step
  let currentStep = 1; // 1: Submitted, 2: Reviewing, 3: Agent Replied, 4: Resolved
  if (ticket.status === 'Submitted') {
    currentStep = 1;
  } else if (ticket.status === 'Under Review') {
    currentStep = 2;
  } else if (ticket.status === 'Agent Replied' || ticket.status === 'Waiting for Customer') {
    currentStep = 3;
  } else if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
    currentStep = 4;
  }

  const steps = [
    { label: 'Ticket submitted', desc: 'Received by desk' },
    { label: 'Reviewing issue', desc: 'Assigned to specialist' },
    { label: 'Agent replied', desc: 'Awaiting review' },
    { label: 'Resolved', desc: 'Case marked closed' }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const names: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        names.push(e.target.files[i].name);
      }
      setAttachedFiles(prev => [...prev, ...names]);
    }
  };

  const removeAttachment = (idxToRemove: number) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && attachedFiles.length === 0) return;

    const mainMessageText = replyText;
    const currentFiles = [...attachedFiles];

    // Create message object
    const newMsg: Message = {
      id: `msg-reply-${Date.now()}`,
      sender: 'customer',
      senderName: ticket.customerName,
      text: mainMessageText || `Uploaded attachment: ${currentFiles.join(', ')}`,
      timestamp: new Date().toISOString(),
      attachments: currentFiles.length > 0 ? currentFiles : undefined
    };

    // Customer replied -> update ticket to 'Under Review' status
    onReplyTicket(ticket.id, newMsg, 'Under Review');
    setReplyText('');
    setAttachedFiles([]);

    // Simulate Agent Auto Acknowledgement trigger in 2.5 seconds
    setTimeout(() => {
      const ackMsg: Message = {
        id: `msg-agent-ack-${Date.now()}`,
        sender: 'agent',
        senderName: 'Sarah (Support Specialist)',
        text: "Hi John, I have received your follow-up reply and updated attachments. I am reviewing the billing log duplicates now and will post another update as soon as the database confirmation is approved.",
        timestamp: new Date().toISOString()
      };
      // Keep state in Under Review but post reply!
      onReplyTicket(ticket.id, ackMsg, 'Agent Replied');
    }, 2500);
  };

  const statusColors: Record<TicketStatus, string> = {
    'Submitted': 'text-slate-700 bg-slate-100 border-slate-200',
    'Under Review': 'text-amber-700 bg-amber-50 border-amber-100',
    'Waiting for Customer': 'text-blue-700 bg-blue-50 border-blue-100',
    'Agent Replied': 'text-indigo-700 bg-indigo-50 border-indigo-100',
    'Resolved': 'text-emerald-700 bg-emerald-50 border-emerald-100',
    'Closed': 'text-slate-600 bg-slate-100 border-slate-200'
  };

  const priorityColors = {
    'Low': 'text-slate-600 bg-slate-100',
    'Medium': 'text-blue-600 bg-blue-50',
    'High': 'text-amber-600 bg-amber-50',
    'Urgent': 'text-red-600 bg-red-50'
  };

  return (
    <div className="space-y-6 font-sans fade-in-el" id="ticket-detail-page">
      
      {/* Back Shortcut Selector */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/customer/track-ticket')}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold py-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Track Ticket</span>
        </button>

        <span className="text-[11px] text-slate-400 font-mono">
          Last Activity: {new Date(ticket.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Thread and Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Ticket Header card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-3xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono bg-slate-100 text-slate-800 text-[11px] font-semibold px-2.5 py-0.5 border border-slate-100 rounded-md">
                    {ticket.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </div>
                <h1 className="font-display font-semibold text-slate-950 text-md sm:text-lg mt-1 tracking-tight">
                  {ticket.subject}
                </h1>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-slate-800 ml-1.5 capitalize">{ticket.category}</span>
              </div>
            </div>

            {/* Meta values */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Customer:</span>
                <span className="font-semibold text-slate-800">{ticket.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Email:</span>
                <span className="font-semibold text-slate-800 break-all">{ticket.customerEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Created:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {new Date(ticket.created).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Priority:</span>
                <span className={`font-semibold inline-block px-2 py-0.5 rounded ${priorityColors[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Step Timeline */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs">
            <h3 className="font-semibold text-slate-800 text-xs mb-5">Workflow Milestones</h3>
            
            <div className="relative">
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 transform -translate-y-1/2 -z-10" />
              
              <div className="grid grid-cols-4 gap-2">
                {steps.map((st, index) => {
                  const stepNum = index + 1;
                  const isDone = stepNum <= currentStep;
                  const isCurrent = stepNum === currentStep;

                  return (
                    <div key={index} className="text-center space-y-2">
                      <div className={`h-8 w-8 rounded-full border-2 mx-auto flex items-center justify-center text-xs font-semibold select-none ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs animate-pulse'
                          : isDone
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-200 bg-white text-slate-400'
                      }`}>
                        {isDone && !isCurrent ? '✓' : stepNum}
                      </div>
                      <div className="px-1">
                        <p className={`font-semibold text-[10px] sm:text-xs leading-none ${isCurrent ? 'text-blue-600' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                          {st.label}
                        </p>
                        <p className="text-[9px] text-slate-400 hidden sm:block mt-0.5">
                          {st.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Thread Conversation */}
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Conversation Logs</h2>
            
            <div className="space-y-4">
              {ticket.conversation.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                return (
                  <div
                    key={msg.id}
                    className={`bg-white border border-slate-100 p-5 rounded-2xl shadow-3xs flex items-start space-x-4 relative ${
                      isCustomer ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-purple-500'
                    }`}
                  >
                    {/* Speaker badge/Avatar */}
                    <div className="flex-shrink-0">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isCustomer ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {isCustomer ? <User className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-xs text-slate-800">
                            {msg.senderName}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-2 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100/60 font-mono">
                            {isCustomer ? 'Ticket Author' : 'Support Agent'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(msg.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="mt-3 text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>

                      {/* Display attachment file references */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-50">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Shared Attachments
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {msg.attachments.map((at, aIdx) => (
                              <div 
                                key={aIdx}
                                className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-100 text-[10px] text-slate-600 font-mono transition-colors"
                              >
                                <Paperclip className="h-3 w-3 shrink-0" />
                                <span>{at}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reply Textarea box */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs">
            <h3 className="font-semibold text-slate-800 text-xs mb-3">Write a reply</h3>
            
            <form onSubmit={handleSendReply} className="space-y-3.5">
              
              <div>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your message of clarification, update, or resolve confirmations here..."
                  className="w-full text-xs block bg-white border border-slate-200 rounded-xl px-3.5 py-3 focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all block"
                />
              </div>

              {/* Display attachment names if selected */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachedFiles.map((f, fIdx) => (
                    <div 
                      key={fIdx} 
                      className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-mono text-slate-600 flex items-center space-x-1"
                    >
                      <span>{f}</span>
                      <button 
                        type="button" 
                        onClick={() => removeAttachment(fIdx)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                {/* Trigger select attachments */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  title="Upload receipt files/images"
                >
                  <Paperclip className="h-4.5 w-4.5" />
                </button>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf,.csv"
                />

                <button
                  type="submit"
                  disabled={!replyText.trim() && attachedFiles.length === 0}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow-xs transition-all flex items-center space-x-1.5 ${
                    replyText.trim() || attachedFiles.length > 0
                      ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                      : 'bg-slate-100 text-slate-350 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Reply</span>
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* Right Column details - Sidebar helper */}
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-4">
            <h3 className="font-semibold text-slate-800 text-xs pb-3 border-b border-slate-50">Resolution metrics</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Response Window:</span>
                <span className="font-semibold text-slate-800 text-right">Usually 24 hrs</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Assigned Agent:</span>
                <span className="font-semibold text-slate-800 text-right">Sarah (Fin. Specialist)</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Support Hours:</span>
                <span className="font-semibold text-slate-800 text-right">M-F, 9:00 - 18:00</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-50 leading-normal text-[11px] text-blue-750 flex items-start space-x-1.5">
                <Info className="h-4.5 w-4.5 shrink-0 text-blue-600 mt-0.5" />
                <p>Support agents review ticket history to resolve issues without redundant questions.</p>
              </div>
            </div>
          </div>

          {/* Quick Help resource Links */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-3">
            <h3 className="font-semibold text-slate-800 text-xs">Helpful resource articles</h3>
            
            <div className="space-y-2 text-xs font-semibold">
              <button 
                onClick={() => onNavigate('/customer/articles/art-1')}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50/30 text-slate-700 hover:text-blue-600 rounded-xl flex items-center justify-between border border-slate-100 transition-colors"
              >
                <span>Refund policy guidelines</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-450" />
              </button>

              <button 
                onClick={() => onNavigate('/customer/articles/art-7')}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50/30 text-slate-700 hover:text-blue-600 rounded-xl flex items-center justify-between border border-slate-100 transition-colors"
              >
                <span>Payment troubleshooting</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-450" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

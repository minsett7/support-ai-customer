import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Check,
  Clock,
  ExternalLink,
  Info,
  RefreshCw,
  User
} from 'lucide-react';
import { createSocket } from '../lib/socket';
import { trackSupportTicket } from '../lib/api';
import {
  PublicSupportTicket,
  SupportTicketReply,
  SupportTicketStatus
} from '../types';

interface TicketDetailViewProps {
  trackingCode: string;
  onNavigate: (route: string) => void;
  onTicketNotification: (
    trackingCode: string,
    title: string,
    message: string
  ) => void;
}

const statusLabels: Record<SupportTicketStatus, string> = {
  submitted: 'Submitted',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed'
};

const statusStyles: Record<SupportTicketStatus, string> = {
  submitted: 'border-slate-200 bg-slate-100 text-slate-700',
  accepted: 'border-blue-100 bg-blue-50 text-blue-700',
  in_progress: 'border-amber-100 bg-amber-50 text-amber-700',
  resolved: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  closed: 'border-slate-200 bg-slate-100 text-slate-600'
};

const priorityStyles = {
  high: 'bg-red-50 text-red-700',
  medium: 'bg-amber-50 text-amber-700',
  low: 'bg-slate-100 text-slate-600'
};

function getMilestone(ticket: PublicSupportTicket) {
  if (ticket.status === 'resolved' || ticket.status === 'closed') return 4;
  if (ticket.replies.length > 0) return 3;
  if (ticket.status === 'accepted' || ticket.status === 'in_progress') return 2;
  return 1;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function TicketDetailView({
  trackingCode,
  onNavigate,
  onTicketNotification
}: TicketDetailViewProps) {
  const normalizedCode = trackingCode.trim().toUpperCase();
  const [ticket, setTicket] = useState<PublicSupportTicket | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  async function loadTicket() {
    setError('');
    setIsLoading(true);

    try {
      const result = await trackSupportTicket(normalizedCode);
      setTicket(result);
      localStorage.setItem('latestSupportTicketCode', result.trackingCode);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Unable to load ticket.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTicket();
  }, [normalizedCode]);

  useEffect(() => {
    const socket = createSocket();

    function joinTrackingRoom() {
      setIsConnected(true);
      socket.emit('join_ticket_tracking', {
        trackingCode: normalizedCode
      });
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    function handleAccepted(payload: {
      trackingCode: string;
      status: SupportTicketStatus;
      acceptedAt: string;
      updatedAt: string;
    }) {
      if (payload.trackingCode !== normalizedCode) return;

      setTicket((current) =>
        current
          ? {
              ...current,
              status: payload.status,
              acceptedAt: payload.acceptedAt,
              updatedAt: payload.updatedAt
            }
          : current
      );
      onTicketNotification(
        normalizedCode,
        'Your ticket was accepted',
        'A support specialist has accepted your ticket.'
      );
    }

    function handleReply(payload: SupportTicketReply & {
      status: SupportTicketStatus;
      updatedAt: string;
      resolvedAt: string | null;
    }) {
      if (payload.trackingCode !== normalizedCode) return;

      setTicket((current) => {
        if (!current || current.replies.some((reply) => reply.id === payload.id)) {
          return current;
        }

        return {
          ...current,
          status: payload.status,
          updatedAt: payload.updatedAt,
          resolvedAt: payload.resolvedAt,
          replies: [...current.replies, payload]
        };
      });
      onTicketNotification(
        normalizedCode,
        `New reply from ${payload.senderName}`,
        payload.message
      );
    }

    function handleStatusUpdated(payload: {
      trackingCode: string;
      status: SupportTicketStatus;
      updatedAt: string;
      resolvedAt: string | null;
      closedAt: string | null;
    }) {
      if (payload.trackingCode !== normalizedCode) return;

      setTicket((current) =>
        current
          ? {
              ...current,
              status: payload.status,
              updatedAt: payload.updatedAt,
              resolvedAt: payload.resolvedAt,
              closedAt: payload.closedAt
            }
          : current
      );
    }

    function handleSocketError(payload: { message?: string }) {
      setError(payload.message || 'Ticket tracking connection error.');
    }

    socket.on('connect', joinTrackingRoom);
    socket.on('disconnect', handleDisconnect);
    socket.on('ticket_accepted', handleAccepted);
    socket.on('ticket_reply', handleReply);
    socket.on('ticket_status_updated', handleStatusUpdated);
    socket.on('socket_error', handleSocketError);

    return () => {
      socket.off('connect', joinTrackingRoom);
      socket.off('disconnect', handleDisconnect);
      socket.off('ticket_accepted', handleAccepted);
      socket.off('ticket_reply', handleReply);
      socket.off('ticket_status_updated', handleStatusUpdated);
      socket.off('socket_error', handleSocketError);
      socket.disconnect();
    };
  }, [normalizedCode, onTicketNotification]);

  if (isLoading) {
    return <div className="py-20 text-center text-sm text-slate-500">Loading ticket...</div>;
  }

  if (!ticket) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        <h2 className="mt-3 text-lg font-semibold text-slate-900">Ticket not found</h2>
        <p className="mt-2 text-xs text-slate-500">{error}</p>
        <button
          onClick={() => onNavigate('/customer/track-ticket')}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Try Another Code
        </button>
      </div>
    );
  }

  const currentMilestone = getMilestone(ticket);
  const assignedAgent = ticket.replies.at(-1)?.senderName || (
    ticket.status === 'submitted' ? 'Awaiting assignment' : 'Support specialist'
  );
  const milestones = [
    { title: 'Ticket submitted', detail: 'Received by support desk' },
    { title: 'Reviewing issue', detail: 'Assigned to specialist' },
    { title: 'Agent replied', detail: 'Response available' },
    { title: 'Resolved', detail: 'Case marked complete' }
  ];

  return (
    <div className="space-y-5 font-sans fade-in-el">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => onNavigate('/customer/track-ticket')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tracker</span>
        </button>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
          <span>{isConnected ? 'Live updates connected' : 'Reconnecting'}</span>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-800">
                    {ticket.trackingCode}
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusStyles[ticket.status]}`}>
                    {statusLabels[ticket.status]}
                  </span>
                </div>
                <h1 className="mt-3 font-display text-xl font-semibold text-slate-950">
                  {ticket.subject}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-400">
                  Category: <span className="ml-1 font-semibold text-slate-800">{ticket.category}</span>
                </p>
                <button
                  type="button"
                  onClick={loadTicket}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                  title="Refresh ticket"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-5 pt-5 text-xs sm:grid-cols-3">
              <div>
                <span className="block font-medium text-slate-400">Customer</span>
                <span className="mt-1 block font-semibold text-slate-800">{ticket.customerFullName}</span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Created</span>
                <span className="mt-1 block font-semibold text-slate-800">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="block font-medium text-slate-400">Priority</span>
                <span className={`mt-1 inline-block rounded-md px-2 py-1 text-[10px] font-semibold capitalize ${priorityStyles[ticket.priority]}`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
            <h2 className="text-xs font-semibold text-slate-800">Workflow Milestones</h2>
            <div className="relative mt-6 grid grid-cols-4 gap-2">
              <div className="absolute left-[12.5%] right-[12.5%] top-5 h-px bg-slate-200" />
              {milestones.map((milestone, index) => {
                const step = index + 1;
                const complete = step < currentMilestone;
                const current = step === currentMilestone;

                return (
                  <div key={milestone.title} className="relative text-center">
                    <div
                      className={`relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                        complete
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : current
                            ? 'border-violet-500 bg-violet-500 text-white'
                            : 'border-slate-200 bg-white text-slate-400'
                      }`}
                    >
                      {complete ? <Check className="h-4 w-4" /> : step}
                    </div>
                    <p className={`mt-2 text-[10px] font-semibold sm:text-xs ${current ? 'text-violet-600' : complete ? 'text-slate-800' : 'text-slate-400'}`}>
                      {milestone.title}
                    </p>
                    <p className="mt-0.5 hidden text-[9px] text-slate-400 sm:block">
                      {milestone.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xs font-semibold uppercase text-slate-800">Conversation Logs</h2>
            <div className="space-y-4">
              <article className="rounded-2xl border border-slate-100 border-l-4 border-l-violet-500 bg-white p-5 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800">{ticket.customerFullName}</span>
                        <span className="rounded-full bg-slate-50 px-2 py-0.5 font-mono text-[9px] text-slate-400">
                          Ticket Author
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-400">{formatDate(ticket.createdAt)}</span>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                      {ticket.description}
                    </p>
                  </div>
                </div>
              </article>

              {ticket.replies.map((reply) => (
                <article
                  key={reply.id}
                  className="rounded-2xl border border-slate-100 border-l-4 border-l-fuchsia-500 bg-white p-5 shadow-xs"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-600">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-800">{reply.senderName}</span>
                          <span className="rounded-full bg-slate-50 px-2 py-0.5 font-mono text-[9px] text-slate-400">
                            Support Agent
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-slate-400">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                        {reply.message}
                      </p>
                    </div>
                  </div>
                </article>
              ))}

              {ticket.replies.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-center text-xs text-slate-400">
                  A support reply will appear here after an agent reviews the ticket.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <h2 className="border-b border-slate-100 pb-4 text-xs font-semibold text-slate-800">
              Resolution metrics
            </h2>
            <dl className="space-y-4 py-5 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Response Window</dt>
                <dd className="text-right font-semibold text-slate-800">Usually 24 hrs</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Assigned Agent</dt>
                <dd className="text-right font-semibold text-slate-800">{assignedAgent}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-400">Last Activity</dt>
                <dd className="text-right font-semibold text-slate-800">{formatDate(ticket.updatedAt)}</dd>
              </div>
            </dl>
            <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-[11px] leading-relaxed text-blue-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <span>Support agents review ticket history to resolve issues without redundant questions.</span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
            <h2 className="text-xs font-semibold text-slate-800">Helpful resource articles</h2>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => onNavigate('/customer/articles/art-1')}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50"
              >
                <span>Refund policy guidelines</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onNavigate('/customer/articles/art-7')}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50"
              >
                <span>Payment troubleshooting</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </section>

          <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Tracking updates arrive automatically while this page is open.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

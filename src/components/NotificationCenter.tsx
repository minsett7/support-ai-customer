import React from 'react';
import { NotificationItem } from '../types';
import { Mail, X, Check, ArrowRight, Clock, ShieldAlert } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onTrackTicket: (ticketId: string) => void;
}

export default function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onTrackTicket,
}: NotificationCenterProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="notification-center-backdrop">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800 text-lg">Customer Email Sandbox</h2>
                <p className="text-xs text-slate-500 font-medium">Previews of real-time support alerts</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {notifications.some(n => !n.isRead) && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2.5 py-1 hover:bg-blue-50 rounded"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-500 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* List of Mock Notifications */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Inbox is empty</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
                  Submit a ticket or trigger a support response to generate simulated emails.
                </p>
              </div>
            ) : (
              [...notifications].reverse().map((notif) => (
                <div
                  key={notif.id}
                  className={`border rounded-xl p-4 transition-all duration-250 relative ${
                    notif.isRead
                      ? 'border-slate-100 bg-white shadow-2xs'
                      : 'border-blue-100 bg-blue-50/30 shadow-xs ring-1 ring-blue-50'
                  }`}
                >
                  {!notif.isRead && (
                    <span className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
                  )}

                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex-shrink-0 text-slate-400">
                      <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                        <Mail className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Email Notification
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center space-x-1 font-mono">
                          <Clock className="h-3 w-3 inline-block" />
                          <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>
                      
                      <h4 className="text-sm font-semibold text-slate-800 mt-1.5 line-clamp-1">
                        {notif.subject}
                      </h4>
                      
                      <div className="mt-2 text-xs text-slate-600 whitespace-pre-line leading-relaxed pb-3 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/60 font-mono">
                        {notif.body}
                      </div>

                      {notif.ticketId && (
                        <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-100">
                          <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono font-medium">
                            {notif.ticketId}
                          </span>
                          
                          <button
                            onClick={() => {
                              onTrackTicket(notif.ticketId!);
                              onClose();
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1 group transition-colors"
                          >
                            <span>Track Ticket</span>
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Warning / Explanation */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 rounded-b-xl flex items-start space-x-2">
            <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Simulated sandbox workspace:</strong> These notifications demo the email responses sent to customer mailboxes. In a production environment, this is dispatched by transactional email relays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

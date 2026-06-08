import React from 'react';
import { Mail, MessageSquare, ChevronRight, Menu, X, HelpCircle } from 'lucide-react';
import { NotificationItem } from '../types';

interface NavigationProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onTriggerChat: () => void;
}

export default function Navigation({
  currentRoute,
  onNavigate,
  notifications,
  onOpenNotifications,
  onTriggerChat
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { label: 'Home', path: '/customer' },
    { label: 'Help Articles', path: '/customer/articles' },
    { label: 'Submit Ticket', path: '/customer/submit-ticket' },
    { label: 'Track Ticket', path: '/customer/track-ticket' },
    { label: 'Contact Support', path: '/customer/contact' }
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40" id="portal-navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left: Brand Logo & Links */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => handleLinkClick('/customer')}
              className="flex items-center space-x-2 focus:outline-none cursor-pointer"
            >
              {/* Approachable, customer-focused logo */}
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="text-left">
                <span className="font-display font-semibold text-slate-800 text-sm tracking-tight block">
                  Support Portal
                </span>
                <span className="text-[10px] text-slate-400 font-medium block leading-none">
                  AI Customer Support system
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1.5 pt-0.5">
              {navItems.map((item) => {
                const isActive = currentRoute === item.path || 
                  (item.path !== '/customer' && currentRoute.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    onClick={() => handleLinkClick(item.path)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-100 text-slate-800'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3">
            {/* Simulation notifications toggle */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-slate-100 shadow-3xs"
              title="Open simulated email inbox"
              id="notifications-mailbox-toggle"
            >
              <Mail className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 bg-blue-600 border border-white text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Direct Instant Chat Trigger */}
            <button
              onClick={onTriggerChat}
              className="hidden sm:flex items-center space-x-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Start Chat</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 block fade-in-el">
          {navItems.map((item) => {
            const isActive = currentRoute === item.path || 
              (item.path !== '/customer' && currentRoute.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => handleLinkClick(item.path)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className={`h-4 w-4 text-slate-400 ${isActive ? 'text-blue-600' : ''}`} />
              </button>
            );
          })}
          
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center px-4">
            <span className="text-[10px] text-slate-400 font-medium">Customer Support Portal</span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onTriggerChat();
              }}
              className="flex items-center space-x-1 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Start Chat</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

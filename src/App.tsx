/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { HelpArticle, NotificationItem } from './types';
import { MOCK_CUSTOMER, MOCK_ARTICLES } from './data';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import NotificationCenter from './components/NotificationCenter';
import CustomerLiveChat from './components/live-chat/CustomerLiveChat';
import HomeView from './components/HomeView';
import SubmitTicketView from './components/SubmitTicketView';
import TrackTicketView from './components/TrackTicketView';
import TicketDetailView from './components/TicketDetailView';
import ArticlesView from './components/ArticlesView';
import ContactView from './components/ContactView';
import { LayoutGrid, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  
  // Custom router state using Hashtag paths (Safe for direct iframe reloads)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#')) {
      return hash.substring(1) || '/customer';
    }
    return '/customer';
  });

  const [articles] = useState<HelpArticle[]>(MOCK_ARTICLES);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // UI states
  const [notifCenterOpen, setNotifCenterOpen] = useState(false);
  const [triggerChatWidget, setTriggerChatWidget] = useState(false);
  const [demoBannerActive, setDemoBannerActive] = useState(true);

  // Parse URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#')) {
        setCurrentPath(hash.substring(1) || '/customer');
      } else {
        setCurrentPath('/customer');
      }
      // Auto-scroll layout to top on route change
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial redirect if path is root without hash
    if (!window.location.hash) {
      window.location.hash = '#/customer';
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = '#' + path;
  };

  const handleTicketNotification = useCallback((
    trackingCode: string,
    subject: string,
    body: string
  ) => {
    const notification: NotificationItem = {
      id: `ticket-update-${trackingCode}-${Date.now()}`,
      ticketId: trackingCode,
      subject,
      body,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'system'
    };

    setNotifications((current) => [...current, notification]);
  }, []);

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleTriggerChatFromOutside = () => {
    // Set widget trigger
    setTriggerChatWidget(true);
    // Find absolute chat element and simulate button click.
    const chatBtn = document.getElementById('chat-toggle-button');
    if (chatBtn) {
      chatBtn.click();
    }
  };

  // Simple view resolver
  const renderView = () => {
    let path = currentPath;
    let queryParams = '';

    if (path.includes('?')) {
      const parts = path.split('?');
      path = parts[0];
      queryParams = parts[1];
    }

    // Route: /customer
    if (path === '/customer' || path === '/customer/help') {
      return (
        <HomeView 
          onNavigate={navigate} 
          articles={articles} 
          onTriggerChat={handleTriggerChatFromOutside} 
        />
      );
    }

    // Route: /customer/articles
    if (path === '/customer/articles') {
      // Check query parameter for initial category filter
      let categoryParam = '';
      if (queryParams && queryParams.includes('category=')) {
        categoryParam = decodeURIComponent(queryParams.split('category=')[1]);
      }
      return (
        <ArticlesView 
          articles={articles} 
          categoryFilter={categoryParam} 
          onNavigate={navigate} 
        />
      );
    }

    // Route: /customer/articles/:id
    if (path.startsWith('/customer/articles/')) {
      const artId = path.substring('/customer/articles/'.length);
      return (
        <ArticlesView 
          articles={articles} 
          selectedArticleId={artId} 
          onNavigate={navigate} 
        />
      );
    }

    // Route: /customer/submit-ticket
    if (path === '/customer/submit-ticket') {
      return (
        <SubmitTicketView 
          onNavigate={navigate} 
          customerName={MOCK_CUSTOMER.name} 
        />
      );
    }

    // Route: /customer/track-ticket
    if (path === '/customer/track-ticket') {
      return (
        <TrackTicketView onNavigate={navigate} />
      );
    }

    // Route: /customer/tickets/:id
    if (path.startsWith('/customer/tickets/')) {
      const trackingCode = decodeURIComponent(
        path.substring('/customer/tickets/'.length)
      );
      return (
        <TicketDetailView 
          trackingCode={trackingCode}
          onNavigate={navigate} 
          onTicketNotification={handleTicketNotification}
        />
      );
    }

    // Route: /customer/contact
    if (path === '/customer/contact') {
      return (
        <ContactView 
          onNavigate={navigate} 
          onTriggerChat={handleTriggerChatFromOutside} 
        />
      );
    }

    // Fallback UI
    return (
      <div className="text-center py-20 space-y-4 font-sans">
        <h2 className="font-semibold text-slate-800 text-lg">Looking for support directions?</h2>
        <p className="text-xs text-slate-500">The url path could not be resolved in the sandbox preview.</p>
        <button
          onClick={() => navigate('/customer')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs"
        >
          Return to Help Center
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans antialiased text-slate-900">
      
      {/* Optional demo route switcher banner */}
      {demoBannerActive && (
        <div className="bg-slate-900 text-white text-[11px] font-medium px-4 py-2 flex flex-col sm:flex-row justify-between items-center border-b border-slate-800 shrink-0 select-none">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="font-mono text-slate-400">Sandbox: AI Support Copilot System</span>
          </div>

          <div className="flex items-center space-x-3.5 mt-2 sm:mt-0">
            <span className="text-slate-400">Active Mode:</span>
            <span className="text-white bg-slate-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] border border-blue-500/20">
              ● Customer Support Portal
            </span>
            <span className="text-slate-500 hover:text-slate-400 line-through cursor-not-allowed text-[10px]" title="Agent/Admin Dashboard is built as a separate internal tool and remains secure from customers.">
              Agent Dashboard (Internal Tool)
            </span>
            <button 
              onClick={() => setDemoBannerActive(false)}
              className="text-slate-500 hover:text-white font-bold ml-1 text-xs px-1 cursor-pointer"
              title="Hide Banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Core Navigation Header */}
      <Navigation
        currentRoute={currentPath}
        onNavigate={navigate}
        notifications={notifications}
        onOpenNotifications={() => setNotifCenterOpen(true)}
        onTriggerChat={handleTriggerChatFromOutside}
      />

      {/* Primary Page Canvas layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {renderView()}
      </main>

      {/* Shared Footer structure */}
      <Footer onNavigate={navigate} />

      {/* Side Slide-out mailbox simulation panel */}
      <NotificationCenter
        isOpen={notifCenterOpen}
        onClose={() => setNotifCenterOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onTrackTicket={(tId) => navigate(`/customer/tickets/${tId}`)}
      />

      {/* Floater Live chat integration */}
      <CustomerLiveChat />

    </div>
  );
}

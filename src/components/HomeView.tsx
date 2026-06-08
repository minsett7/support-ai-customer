import React, { useState } from 'react';
import { HelpArticle } from '../types';
import { 
  Search, 
  FileText, 
  MessageSquare, 
  SearchCode, 
  ArrowRight,
  CreditCard,
  UserCheck,
  Shield,
  HelpCircle,
  Cpu,
  Bookmark,
  History,
  LifeBuoy
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (route: string) => void;
  articles: HelpArticle[];
  onTriggerChat: () => void;
}

export default function HomeView({ onNavigate, articles, onTriggerChat }: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Filter articles based on home search query
  const filteredArticles = searchQuery.trim()
    ? articles.filter(art => 
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Popular Articles list
  const popularArticles = articles.slice(0, 8);

  const categories = [
    { name: 'Billing & Refunds', icon: CreditCard, color: 'text-blue-650 bg-blue-50 border-blue-100' },
    { name: 'Account & Login', icon: UserCheck, color: 'text-emerald-650 bg-emerald-50 border-emerald-100' },
    { name: 'Technical Issues', icon: Cpu, color: 'text-purple-650 bg-purple-50 border-purple-100' },
    { name: 'Security', icon: Shield, color: 'text-rose-650 bg-rose-50 border-rose-100' },
    { name: 'Product Questions', icon: HelpCircle, color: 'text-amber-650 bg-amber-50 border-amber-100' },
    { name: 'Orders & Payments', icon: CreditCard, color: 'text-indigo-650 bg-indigo-50 border-indigo-100' },
    { name: 'API & Integrations', icon: SearchCode, color: 'text-cyan-650 bg-cyan-50 border-cyan-100' },
    { name: 'Contact Support', icon: LifeBuoy, color: 'text-slate-650 bg-slate-50 border-slate-100' }
  ];

  const handleCategoryClick = (catName: string) => {
    if (catName === 'Contact Support') {
      onNavigate('/customer/contact');
    } else {
      // Navigate to articles filtered by this category
      onNavigate(`/customer/articles?category=${encodeURIComponent(catName)}`);
    }
  };

  return (
    <div className="space-y-8 font-sans fade-in-el" id="home-view-bento">
      
      {/* Dynamic Header Welcoming with Clean Subdued Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <span className="text-[10px] bg-blue-50 text-blue-700 font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-blue-100 inline-block">
            Bento Support Center
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 mt-2 tracking-tight">
            Dashboard Workspace
          </h2>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Self-serve documentation is fully indexed.</span>
        </div>
      </div>

      {/* Bento Grid Wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Block 1: Hero & Search Box (Spans 8 Columns in desktop) */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-center shadow-xs relative overflow-hidden">
          {/* Decorative watermark icon */}
          <div className="absolute right-0 bottom-0 text-slate-50 pointer-events-none select-none translate-x-1/4 translate-y-1/4 transform">
            <Bookmark className="h-44 w-44 text-slate-100/50" />
          </div>
          
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-widest block">Intellectual Search Engine</span>
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight leading-snug">
              How can we help?
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg">
              Search real articles or initiate active tracker channels with online specialist teams.
            </p>
            
            {/* Unified Search Input container */}
            <div className="relative mt-6 max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.length > 0);
                }}
                onFocus={() => {
                  if (searchQuery) setShowSearchResults(true);
                }}
                placeholder="Search billing, password resetting, refunds, API sandbox..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-xs sm:text-sm transition-all block font-medium placeholder-slate-400"
              />

              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowSearchResults(false);
                  }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Clear
                </button>
              )}

              {/* Dynamic Instant Search autocomplete dropdown */}
              {showSearchResults && (
                <div className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 max-h-72 overflow-y-auto text-left py-2.5">
                  <div className="px-4 py-1.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Search Results ({filteredArticles.length})
                    </span>
                    <button 
                      onClick={() => setShowSearchResults(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold"
                    >
                      Close Window
                    </button>
                  </div>
                  {filteredArticles.length === 0 ? (
                    <div className="p-5 text-center text-xs text-slate-500">
                      No articles match your query. Try "Refund" or "API".
                    </div>
                  ) : (
                    filteredArticles.map((art) => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => {
                          setShowSearchResults(false);
                          onNavigate(`/customer/articles/${art.id}`);
                        }}
                        className="w-full px-4 py-3 hover:bg-slate-50 text-left flex items-start space-x-3 group transition-colors border-b border-slate-55 block cursor-pointer"
                      >
                        <FileText className="h-4 w-4 text-slate-400 mt-0.5 group-hover:text-blue-600 shrink-0" />
                        <div>
                          <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {art.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {art.summary}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Block 2: Quick Action: "Submit a Ticket" (Spans 4 Columns in desktop) */}
        <div className="md:col-span-4 bg-blue-600 rounded-3xl p-6 text-white flex flex-col justify-between shadow-xs relative overflow-hidden group">
          {/* Soft background decor light blur */}
          <div className="absolute right-0 top-0 h-28 w-28 bg-white/5 rounded-full filter blur-2xl" />
          
          <div>
            <span className="inline-block text-[9px] bg-white/20 px-2.5 py-1 rounded-full text-white font-bold tracking-wider uppercase">
              24h Response SLA
            </span>
            <h3 className="text-xl font-bold font-display tracking-tight mt-4">Submit a Ticket</h3>
            <p className="text-blue-100/90 text-[11px] sm:text-xs mt-2.5 leading-relaxed">
              Send us your issue directly and our support team will reply within 24 business hours. Fully tracked.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/customer/submit-ticket')}
            className="mt-6 w-full py-3 bg-white hover:bg-slate-50 text-blue-600 rounded-2xl font-bold transition-all shadow-xs text-xs cursor-pointer text-center block hover:scale-[1.01]"
          >
            Create Ticket
          </button>
        </div>

        {/* Block 3: Track Ticket Widget (Spans 4 Columns) */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                <History className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Track Ticket</h3>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed pt-1">
              Already submitted? Keep tabs on messages, attachments updates and assigned operators without registering.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/customer/track-ticket')}
            className="mt-6 w-full py-3 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-xs text-xs cursor-pointer text-center block"
          >
            Find Active Ticket
          </button>
        </div>

        {/* Block 4: Instant Live Chat Widget Box (Spans 4 Columns) */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Live Support Chat</h3>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed pt-1">
              Need rapid triage? Launch our interactive digital chat widget in the lower right and consult online assistance.
            </p>
          </div>

          <button
            onClick={onTriggerChat}
            className="mt-6 w-full py-3 bg-indigo-50 hover:bg-indigo-100/65 text-indigo-700 border border-indigo-100 rounded-2xl font-bold transition-all text-xs cursor-pointer text-center block text-center"
          >
            Start Chat Session
          </button>
        </div>

        {/* Block 5: Business SLA Hours (Spans 4 Columns) */}
        <div className="md:col-span-4 bg-slate-950 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between border border-slate-800">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-700/60">
                Operating Hours
              </span>
              <span className="text-emerald-400 font-semibold text-[10px] flex items-center">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full inline-block animate-pulse mr-1"></span>
                Active Shift
              </span>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed pt-1">
              Standard operator desk shifts run Monday through Friday, 09:00 to 18:00 UTC. Prioritised morning review.
            </p>

            <div className="space-y-2 pt-1 text-[11px] font-mono">
              <div className="flex justify-between items-center pb-1.5 border-b border-white/5 text-slate-400">
                <span>Working Days:</span>
                <span className="font-semibold text-white">Mon — Fri</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Medium Resolution:</span>
                <span className="font-semibold text-emerald-400">&lt; 24h</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/customer/contact')}
            className="mt-6 w-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-2.5 rounded-2xl transition cursor-pointer flex items-center justify-center space-x-1.5 border border-white/10"
          >
            <span>Hotline Directory</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Block 6: Help Categories directory (Spans 8 Columns in desktop) */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm font-display tracking-tight">Browse Help by Category</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Select a core topic to explore relative instructions guidelines.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="p-3 bg-slate-50/60 border border-slate-100 hover:border-slate-350 hover:bg-slate-50 rounded-2xl transition-all text-left flex flex-col items-start block group cursor-pointer"
                >
                  <div className={`p-1.5 rounded-xl border ${cat.color} transition-transform group-hover:scale-105 shadow-xs`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-[11px] text-slate-800 mt-3 leading-tight group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Block 7: Popular Hot Guides (Spans 4 Columns) */}
        <div className="md:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm font-display tracking-tight">Popular User Guides</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Frequently reviewed standard operational guidelines.</p>
          </div>

          <div className="space-y-2 flex-1">
            {popularArticles.slice(0, 3).map((art) => (
              <button
                key={art.id}
                onClick={() => onNavigate(`/customer/articles/${art.id}`)}
                className="w-full text-left bg-slate-50/50 hover:bg-blue-50/10 border border-slate-100 hover:border-blue-150 p-2.5 rounded-xl transition-all flex justify-between items-center group cursor-pointer"
              >
                <div className="truncate pr-2">
                  <span className="block text-[8px] text-slate-400 font-semibold uppercase tracking-wider">
                    {art.category}
                  </span>
                  <span className="font-semibold text-[11px] text-slate-700 block truncate group-hover:text-blue-650 transition-colors">
                    {art.title}
                  </span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigate('/customer/articles')}
            className="mt-4 w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline py-1"
          >
            Show All Articles →
          </button>
        </div>

        {/* Block 8: More Troubleshooting list (Spans 8 Columns in desktop) */}
        <div className="md:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm font-display tracking-tight">Troubleshooting Documentation & Tutorials</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Quickly consult relative instructions and configuration directives.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {popularArticles.slice(3, 7).map((art) => (
              <button
                key={art.id}
                onClick={() => onNavigate(`/customer/articles/${art.id}`)}
                className="w-full text-left bg-slate-50/40 hover:bg-slate-50 border border-slate-100 p-3 rounded-2xl transition-all flex items-start space-x-2.5 group cursor-pointer"
              >
                <div className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 group-hover:text-blue-500 mt-0.5 shadow-3xs transition-colors">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="truncate">
                  <span className="font-semibold text-[11px] text-slate-700 block truncate group-hover:text-blue-600">
                    {art.title}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                    {art.summary}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

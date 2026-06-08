import React, { useState, useEffect } from 'react';
import { HelpArticle } from '../types';
import { 
  Search, 
  ChevronRight, 
  ThumbsUp, 
  ThumbsDown, 
  Calendar, 
  HelpCircle, 
  MessageSquare, 
  FileText,
  LifeBuoy,
  Tag,
  Clock,
  ArrowLeft
} from 'lucide-react';

interface ArticlesViewProps {
  articles: HelpArticle[];
  selectedArticleId?: string;
  categoryFilter?: string;
  onNavigate: (route: string) => void;
}

export default function ArticlesView({
  articles,
  selectedArticleId,
  categoryFilter = '',
  onNavigate
}: ArticlesViewProps) {
  
  const [selectedCat, setSelectedCat] = useState(categoryFilter);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Rating tracking (articleId -> 'helpful' | 'unhelpful')
  const [userRatings, setUserRatings] = useState<Record<string, 'helpful' | 'unhelpful'>>({});

  // Sync state if prop changes
  useEffect(() => {
    setSelectedCat(categoryFilter);
  }, [categoryFilter]);

  // Categories list
  const categories = [
    'All Options',
    'Billing & Refunds',
    'Account & Login',
    'Technical Issues',
    'Security',
    'Orders & Payments',
    'API & Integrations'
  ];

  // Resolve selected Article detail if ID was parsed
  const activeArticle = selectedArticleId 
    ? articles.find(art => art.id === selectedArticleId)
    : null;

  // Filter articles list
  const visibleArticles = articles.filter(art => {
    const matchesCategory = !selectedCat || selectedCat === 'All Options' || art.category === selectedCat;
    const matchesSearch = !searchQuery.trim() || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.contentSections.some(sec => sec.title.toLowerCase().includes(searchQuery.toLowerCase()) || sec.body.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const handleRateArticle = (id: string, type: 'helpful' | 'unhelpful') => {
    if (userRatings[id]) return; // Allow rating only once
    setUserRatings(prev => ({ ...prev, [id]: type }));
  };

  // 1. RENDER ARTICLE DETAIL
  if (activeArticle) {
    const hasRated = userRatings[activeArticle.id];
    const initialHelpful = activeArticle.helpfulCount || 10;
    const finalHelpful = hasRated === 'helpful' ? initialHelpful + 1 : initialHelpful;
    const initialUnhelpful = activeArticle.unhelpfulCount || 2;
    const finalUnhelpful = hasRated === 'unhelpful' ? initialUnhelpful + 1 : initialUnhelpful;

    return (
      <div className="max-w-3xl mx-auto space-y-6 font-sans fade-in-el" id="article-detail-page">
        
        {/* Back and Breadcrumb */}
        <div className="flex justify-between items-center text-xs">
          <button
            onClick={() => onNavigate('/customer/articles')}
            className="inline-flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 font-semibold py-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Articles</span>
          </button>
          <div className="text-slate-400 font-semibold uppercase tracking-wider font-mono">
            Help Article Guide
          </div>
        </div>

        {/* Article Body */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-5 space-y-3">
            <span className="inline-flex items-center space-x-1.5 text-[10px] bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              <Tag className="h-3 w-3" />
              <span>{activeArticle.category}</span>
            </span>

            <h1 className="font-display font-bold text-slate-900 text-lg sm:text-2xl tracking-tight">
              {activeArticle.title}
            </h1>

            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Last Updated: {activeArticle.updatedDate}</span>
              </span>
              <span>•</span>
              <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                Verified Guide
              </span>
            </div>
          </div>

          {/* Chapters loop */}
          <div className="space-y-6">
            {activeArticle.contentSections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {idx + 1}. {sec.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {sec.body}
                </p>
              </div>
            ))}
          </div>

          {/* Feedback section banner */}
          <div className="border-t border-slate-100 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold text-slate-800 text-xs">Was this support article helpful?</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Your input helps us shape human documentation pipelines.</p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <button
                onClick={() => handleRateArticle(activeArticle.id, 'helpful')}
                disabled={hasRated !== undefined}
                className={`inline-flex items-center space-x-1.5 px-4 py-2 border rounded-xl font-semibold transition-all cursor-pointer ${
                  hasRated === 'helpful'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : hasRated === 'unhelpful'
                      ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Helpful ({finalHelpful})</span>
              </button>

              <button
                onClick={() => handleRateArticle(activeArticle.id, 'unhelpful')}
                disabled={hasRated !== undefined}
                className={`inline-flex items-center space-x-1.5 px-4 py-2 border rounded-xl font-semibold transition-all cursor-pointer ${
                  hasRated === 'unhelpful'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : hasRated === 'helpful'
                      ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800'
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span>Not Helpful ({finalUnhelpful})</span>
              </button>
            </div>
          </div>
        </div>

        {/* CTA Banner: Need support still? */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-semibold text-md font-display">Still looking for tailored help?</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">Our support specialists are online Monday to Friday. Submit a personalized ticket with attachment logs.</p>
          </div>
          <button
            onClick={() => onNavigate('/customer/submit-ticket')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-xs shrink-0 cursor-pointer text-center"
          >
            Submit Support Ticket
          </button>
        </div>

      </div>
    );
  }

  // 2. RENDER ARTICLES LIST
  return (
    <div className="space-y-8 font-sans fade-in-el" id="articles-list-view">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-semibold text-slate-900 text-2xl tracking-tight">
          Help Articles Guidelines
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-lg leading-relaxed">
          Browse verified instructions, security logs, and payment policies to troubleshoot quick setups.
        </p>
      </div>

      {/* Control Area: Tab filter + Search bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search matching articles..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-white text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all outline-hidden block"
          />
        </div>

        {/* Category filtering tab dropdown wrapper on mobile, buttons on desktop */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => {
            const isSelected = selectedCat === cat || (cat === 'All Options' && !selectedCat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat === 'All Options' ? '' : cat)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold shrink-0 transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

      </div>

      {/* Articles Cards Grid */}
      {visibleArticles.length === 0 ? (
        <div className="bg-white border border-slate-100 p-12 text-center rounded-2xl shadow-3xs max-w-md mx-auto space-y-3">
          <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-slate-700 font-semibold text-xs sm:text-sm">No documented articles match filters</h3>
          <p className="text-[11px] text-slate-450">Try broadening your search phrasing or resetting your category tab to "All Options".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleArticles.map((art) => (
            <div
              key={art.id}
              className="bg-white border border-slate-100 p-5 rounded-2xl hover:border-slate-350 shadow-3xs hover:shadow-sm transition-all flex flex-col justify-between block group"
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-3">
                  <span className="inline-block text-[9px] bg-slate-100 text-slate-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Updated {art.updatedDate}
                  </span>
                </div>

                <h3 className="font-semibold text-slate-800 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                  {art.title}
                </h3>
                
                <p className="text-[11px] text-slate-500 leading-relaxed mt-2 line-clamp-2">
                  {art.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-50/60 mt-4 flex items-center justify-between">
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center">
                  <ThumbsUp className="h-3 w-3 inline mr-1" />
                  <span>{art.helpfulCount || 10} Helpful Marks</span>
                </span>

                <button
                  onClick={() => onNavigate(`/customer/articles/${art.id}`)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1 hover:underline cursor-pointer"
                >
                  <span>Read Guide</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

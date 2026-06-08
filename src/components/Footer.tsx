import React from 'react';
import { HelpCircle, RefreshCw } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-white border-t border-slate-200 py-10 mt-16 font-sans" id="portal-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-slate-500">
          
          {/* Brand and Description */}
          <div className="flex items-center space-x-2.5">
            <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
              <HelpCircle className="h-4 w-4" />
            </div>
            <span>© 2026 Support Portal. All systems operational.</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            <button 
              onClick={() => onNavigate('/customer')} 
              className="hover:text-blue-600 transition-colors font-medium cursor-pointer"
            >
              Help Center
            </button>
            <button 
              onClick={() => onNavigate('/customer/contact')} 
              className="hover:text-blue-600 transition-colors font-medium cursor-pointer"
            >
              Contact Support
            </button>
            <span className="text-slate-200">|</span>
            <span className="hover:text-slate-800 transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-800 transition-colors">Terms of Service</span>
          </div>

          {/* Service Status */}
          <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-semibold border border-emerald-100">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block mr-0.5 animate-pulse" />
            <span>Systems Normal</span>
          </div>

        </div>
      </div>
    </footer>
  );
}

import React, { useState } from 'react';
import { 
  FileText, 
  MessageSquare, 
  BookOpen, 
  History, 
  ShieldAlert, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  PhoneCall
} from 'lucide-react';

interface ContactViewProps {
  onNavigate: (route: string) => void;
  onTriggerChat: () => void;
}

export default function ContactView({ onNavigate, onTriggerChat }: ContactViewProps) {
  
  // Accordion active tracker for FAQs
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const options = [
    {
      title: 'Submit a Ticket',
      desc: 'Best for detailed configuration issues, payment questions, and standard inquiries.',
      btnLabel: 'Submit Ticket',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      action: () => onNavigate('/customer/submit-ticket')
    },
    {
      title: 'Start Live Chat',
      desc: 'Best for rapid questions and urgent account login issues. Speak directly with online agents.',
      btnLabel: 'Start Chat',
      icon: MessageSquare,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      action: onTriggerChat
    },
    {
      title: 'Browse Help Articles',
      desc: 'Find answers, payment rules, and API connection guides inside our self-serve guidelines.',
      btnLabel: 'View Articles',
      icon: BookOpen,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      action: () => onNavigate('/customer/articles')
    },
    {
      title: 'Track Existing Ticket',
      desc: 'Check progress, view message threads, and reply to agent updates without an account.',
      btnLabel: 'Track Ticket',
      icon: History,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      action: () => onNavigate('/customer/track-ticket')
    },
    {
      title: 'Report Security Issue',
      desc: 'Report data exposure, credential leaks, or unrecognized transactions instantly.',
      btnLabel: 'Report Issue',
      icon: ShieldAlert,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
      action: () => {
        // Preload submitting an Urgent security ticket
        onNavigate('/customer/submit-ticket');
      }
    }
  ];

  const faqs = [
    {
      q: 'How fast will customer support reply?',
      a: 'We review and reply to all priority tickets within 24 hours. General security concerns and urgent billing errors are triaged immediately, often within 1 to 2 hours during active support desk shifts.'
    },
    {
      q: 'Can I update my ticket after submitting?',
      a: 'Absolutely. Use the "Track Ticket" lookup using your email and Ticket ID (e.g. TCK-001). Write a message in the thread box, select attachments, and click Send. This automatically alerts our assigned support specialist.'
    },
    {
      q: 'What information should I include in my ticket?',
      a: 'To speed up investigation ratios, provide explicit invoice details, transactional hashes from payment gateways, registered user emails, and screenshots of browser debugger logs or error prompts.'
    },
    {
      q: 'How do I attach screenshots or receipts?',
      a: 'Our submit ticket container and ticket reply text fields support drag & drop or direct uploading. You can select PNG, JPG, PDF, or CSV transaction statements up to a size limit of 10MB per file.'
    }
  ];

  const toggleFaq = (idx: number) => {
    setActiveFaq(prev => prev === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 font-sans fade-in-el" id="contact-support-page">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="font-display font-semibold text-slate-900 text-3xl tracking-tight">
          Contact Support
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Need personalized help? Choose down below from our live channels, tracking monitors, or search tools.
        </p>
      </div>

      {/* Grid options directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {options.map((opt, idx) => {
          const Icon = opt.icon;
          return (
            <div 
              key={idx}
              className="bg-white border border-slate-100 p-5 rounded-2xl flex flex-col justify-between hover:shadow-xs transition-all hover:border-slate-350 block group"
            >
              <div>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${opt.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <h3 className="font-semibold text-slate-800 text-xs sm:text-sm mt-4 group-hover:text-blue-600 transition-colors">
                  {opt.title}
                </h3>
                
                <p className="text-xs text-slate-500 leading-relaxed mt-2">
                  {opt.desc}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-50/60">
                <button
                  onClick={opt.action}
                  className="w-full text-xs font-semibold py-2.5 px-4 rounded-xl border border-blue-100 text-blue-600 bg-blue-50/20 hover:bg-blue-600 hover:text-white transition-all cursor-pointer text-center block"
                >
                  {opt.btnLabel}
                </button>
              </div>
            </div>
          );
        })}

        {/* Live Hotline Sidebar representation */}
        <div className="bg-slate-950 text-white p-5 rounded-2xl flex flex-col justify-between border border-slate-800">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center text-white">
              <PhoneCall className="h-5 w-5 text-emerald-400" />
            </div>

            <h3 className="font-semibold text-sm">Emergency Hotlines</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              For immediate phone escalation during full server lockdowns or severe accounts breaches.
            </p>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Security desk:</span>
                <span className="font-mono font-semibold">+1 (800) 555-0199</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Enterprise SLA:</span>
                <span className="font-mono font-semibold">Priority routing only</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 text-[10px] text-slate-400 italic">
            "Available 24/7 for catastrophic service failure alerts."
          </div>
        </div>
      </div>

      {/* Support Hours */}
      <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-xs sm:text-sm">Standard Operating Desk Shifts</h3>
            <p className="text-slate-500 text-xs leading-relaxed mt-0.5">
              Our support team operates Monday through Friday, 9:00 AM – 6:00 PM UTC. Tickets made out-of-shift are queued for priority morning triage.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-3.5 rounded-xl shrink-0 text-center font-semibold text-xs text-slate-700">
          <span>Active Shift: </span>
          <span className="text-emerald-500">M-F, 09:00 - 18:00</span>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-5">
        <div className="flex items-center space-x-2">
          <HelpCircle className="h-5 w-5 text-indigo-500" />
          <h2 className="font-display font-semibold text-slate-900 text-lg tracking-tight">
            Frequently Asked Support Questions
          </h2>
        </div>

        <div className="space-y-2.5">
          {faqs.map((f, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white border border-slate-100 rounded-2xl shadow-3xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-50/50 cursor-pointer"
                >
                  <span className="font-semibold text-xs text-slate-800">{f.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-500 border-t border-slate-50/50 pt-2 leading-relaxed whitespace-pre-line bg-slate-50/30">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

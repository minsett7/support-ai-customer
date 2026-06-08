import React, { useState, useRef } from 'react';
import { Ticket, TicketPriority, TicketStatus } from '../types';
import { 
  FileText, 
  Upload, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X,
  FileMinus,
  Paperclip
} from 'lucide-react';

interface SubmitTicketViewProps {
  onSubmitTicket: (ticket: Ticket) => void;
  onNavigate: (route: string) => void;
  customerName: string;
  customerEmail: string;
}

export default function SubmitTicketView({ 
  onSubmitTicket, 
  onNavigate, 
  customerName, 
  customerEmail 
}: SubmitTicketViewProps) {
  
  // Form fields
  const [name, setName] = useState(customerName);
  const [email, setEmail] = useState(customerEmail);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Billing & Refunds');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [errMessage, setErrMessage] = useState('');

  // Attachment upload simulation
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const filesArray: string[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        filesArray.push(e.dataTransfer.files[i].name);
      }
      setAttachedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        filesArray.push(e.target.files[i].name);
      }
      setAttachedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit form trigger
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrMessage('');

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrMessage('Please fill all the mandatory text fields.');
      return;
    }

    if (!consent) {
      setErrMessage('Please agree to the support information consent checkbox.');
      return;
    }

    // Generate ticket ID
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newId = `TCK-${randomSuffix}`;

    const newTicket: Ticket = {
      id: newId,
      subject: subject,
      customerName: name,
      customerEmail: email,
      category: category,
      priority: priority,
      status: 'Submitted',
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      message: message,
      attachments: attachedFiles.length > 0 ? attachedFiles : undefined,
      conversation: [
        {
          id: `msg-${Date.now()}`,
          sender: 'customer',
          senderName: name,
          text: message,
          timestamp: new Date().toISOString(),
          attachments: attachedFiles.length > 0 ? attachedFiles : undefined
        }
      ]
    };

    onSubmitTicket(newTicket);
    setGeneratedTicketId(newId);
    setShowSuccessModal(true);
  };

  const loadMockBillingExample = () => {
    setSubject("Charged twice and still no refund");
    setMessage("I was charged twice yesterday and I still have not received my refund. This is really frustrating.");
    setCategory("Billing & Refunds");
    setPriority("High");
    setAttachedFiles(["receipt_duplicate_charge.pdf"]);
    setConsent(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans fade-in-el" id="submit-ticket-page">
      
      {/* Page Title Header */}
      <div>
        <h1 className="font-display font-semibold text-slate-900 text-2xl tracking-tight">
          Submit a Support Ticket
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
          Tell us what happened with your account or order, and our dedicated support team will get back to you as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Submit Ticket Form Card */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-xs p-6 space-y-6">
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            
            {errMessage && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errMessage}</span>
              </div>
            )}

            {/* Row 1: Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-white text-xs border border-slate-200 rounded-xl px-3.5 py-3 focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all outline-hidden block"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white text-xs border border-slate-200 rounded-xl px-3.5 py-3 focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all outline-hidden block"
                />
              </div>
            </div>

            {/* Row 2: Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of the issue (e.g., duplicated invoice charge)"
                className="w-full bg-white text-xs border border-slate-200 rounded-xl px-3.5 py-3 focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all outline-hidden block"
              />
            </div>

            {/* Row 3: Category and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white text-xs border border-slate-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all outline-hidden block"
                >
                  <option value="Billing & Refunds">Billing & Refunds</option>
                  <option value="Account & Login">Account & Login</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Security Concern">Security Concern</option>
                  <option value="Product Question">Product Question</option>
                  <option value="Orders & Payments">Orders & Payments</option>
                  <option value="API & Integrations">API & Integrations</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full bg-white text-xs border border-slate-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all outline-hidden block"
                >
                  <option value="Low">Low (General Inquiry)</option>
                  <option value="Medium">Medium (Affects daily use)</option>
                  <option value="High">High (Urgent billing or tech error)</option>
                  <option value="Urgent">Urgent (System blocking blockout)</option>
                </select>
              </div>
            </div>

            {/* Row 4: Message Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Message *</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue with context, timestamps, or errors seen. This helps our agent resolve it faster..."
                className="w-full bg-white text-xs border border-slate-200 rounded-xl px-3.5 py-3 focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all outline-hidden block"
              />
              <div className="flex items-start space-x-1 mt-1.5 text-[10px] text-slate-400">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-500" />
                <span>Please do not include full card numbers, passwords, or secret API keys.</span>
              </div>
            </div>

            {/* Drag & Drop File Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attachments (Screenshots, Receipts, CSV, PDF)</label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-blue-600 bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/50'
                }`}
              >
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 mb-2">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Drag & drop files here, or click to browse</p>
                <p className="text-[10px] text-slate-400 mt-1">Supports PNG, PDF, JPG, CSV up to 10MB each</p>
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".png,.pdf,.jpg,.jpeg,.csv,.doc"
                />
              </div>

              {/* Show selected file names */}
              {attachedFiles.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {attachedFiles.map((fname, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between text-xs font-mono bg-slate-50 px-3 py-1.5 border border-slate-100 rounded-lg text-slate-600"
                    >
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{fname}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Consent check */}
            <div className="pt-2">
              <label className="flex items-start text-xs text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-blue-600 border-slate-300 rounded-md focus:ring-blue-500 mr-2.5"
                />
                <span className="leading-normal">
                  I agree that support specialists may use my supplied credentials to help investigate and resolve this technical issue. *
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                Submit Ticket
              </button>
            </div>

          </form>

        </div>

        {/* Right Side: Quick Helper Side Panel */}
        <div className="space-y-6">
          
          <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
            <h3 className="font-semibold text-xs uppercase text-slate-400 tracking-wider">
              Need a quick test?
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Click below to load our standard mock double billing error into the ticket form.
            </p>
            <button
              onClick={loadMockBillingExample}
              className="mt-3.5 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              ⚡ Load Mock Refund Ticket content
            </button>
          </div>

          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-3xs space-y-3">
            <h3 className="font-semibold text-slate-800 text-xs">Helpful Submission Tips</h3>
            <ul className="text-xs text-slate-500 space-y-2.5 leading-relaxed">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 text-md inline-block leading-none mt-0.5">▪</span>
                <span>To speed up double charges investigation, upload a clear transaction duplicate receipt screenshot.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 text-md inline-block leading-none mt-0.5">▪</span>
                <span>Double check your email. Your ticket tracking link will descend on your primary mailbox.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 text-md inline-block leading-none mt-0.5">▪</span>
                <span>Security concern submissions are handled immediately outside standard queue hours.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* Success Modal Dialogue */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 max-w-md w-full shadow-2xl space-y-6 text-center fade-in-el">
            
            <div className="h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-semibold text-slate-900 text-lg">
                Your ticket has been submitted
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our support team has received your request and assigned a ticket ID.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100/60 p-4 rounded-2xl text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Assigned Ticket ID:</span>
                <span className="font-mono font-semibold bg-white p-1 rounded border border-slate-100 text-slate-800 text-[11px]">
                  {generatedTicketId}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Initial Status:</span>
                <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full text-[10px]">
                  Submitted
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 font-medium">
                <span>Est. Response Window:</span>
                <span className="text-slate-800">Usually within 24 hours</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              "Save your Ticket ID. You can use it with your email address to track this ticket's status on our Track Ticket panel."
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigate('/customer');
                }}
                className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl py-2.5 cursor-pointer"
              >
                Back to Help Center
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigate(`/customer/tickets/${generatedTicketId}`);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl py-2.5 cursor-pointer"
              >
                Track This Ticket
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

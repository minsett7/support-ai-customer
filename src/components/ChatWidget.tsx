import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { 
  MessageSquare, 
  X, 
  Minus, 
  Send, 
  Paperclip, 
  Star, 
  ChevronRight, 
  Sparkles,
  Info
} from 'lucide-react';

interface ChatWidgetProps {
  onNavigate: (route: string) => void;
  customerEmail: string;
  customerName: string;
}

type ChatState = 'closed' | 'welcome' | 'prechat' | 'active' | 'ended';

export default function ChatWidget({ onNavigate, customerEmail, customerName }: ChatWidgetProps) {
  const [chatState, setChatState] = useState<ChatState>('closed');
  const [preChatForm, setPreChatForm] = useState({
    name: customerName,
    email: customerEmail,
    category: 'Billing & Refunds',
    message: ''
  });
  
  // Base transcript loaded initially
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'chat-sys-1',
      sender: 'system',
      senderName: 'System',
      text: 'Chat session started with Support Agent.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'chat-msg-1',
      sender: 'customer',
      senderName: 'John Smith',
      text: 'My account was charged twice. I need this fixed now.',
      timestamp: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      id: 'chat-msg-2',
      sender: 'agent',
      senderName: 'Sarah (Support Agent)',
      text: 'I’m sorry for the trouble. Could you please share the transaction ID or payment receipt so we can verify the duplicate charge?',
      timestamp: new Date(Date.now() - 3400000).toISOString(),
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  
  // Feedback rating state
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, chatState]);

  const handleStartChatFromPrechat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preChatForm.name.trim() || !preChatForm.email.trim() || !preChatForm.message.trim()) {
      return;
    }
    
    // Add user's prechat message as first active message
    const newMessages: Message[] = [
      {
        id: 'chat-sys-welcome',
        sender: 'system',
        senderName: 'System',
        text: `Support stream initialized. Category: ${preChatForm.category}`,
        timestamp: new Date().toISOString(),
      },
      {
        id: `user-prechat-${Date.now()}`,
        sender: 'customer',
        senderName: preChatForm.name,
        text: preChatForm.message,
        timestamp: new Date().toISOString(),
      },
      {
        id: `agent-prechat-ack-${Date.now()}`,
        sender: 'agent',
        senderName: 'Sarah (Support Agent)',
        text: `Hi ${preChatForm.name}, thank you for contacting support regarding ${preChatForm.category}. I have loaded your request details. Let me take a look at this for you right away.`,
        timestamp: new Date().toISOString()
      }
    ];

    setMessages(newMessages);
    setChatState('active');
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() && !uploadedFileName) return;

    const userText = inputValue;
    const attachmentName = uploadedFileName;
    
    const newMsg: Message = {
      id: `customer-chat-${Date.now()}`,
      sender: 'customer',
      senderName: preChatForm.name || 'Customer',
      text: userText || `Uploaded file: ${attachmentName}`,
      timestamp: new Date().toISOString(),
      attachments: attachmentName ? [attachmentName] : undefined
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setUploadedFileName(null);

    // Simulate Agent Typing & Response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      let replyText = "Thank you for the quick details. I am forwarding this record to our verification desk to expedite your request.";
      if (userText.toLowerCase().includes('receipt') || userText.toLowerCase().includes('pdf') || attachmentName) {
        replyText = "Perfect! I have received your payment proof file. Let me cross-verify this directly inside our transaction dashboard. This usually takes just a couple of minutes.";
      } else if (userText.toLowerCase().includes('refund') || userText.toLowerCase().includes('charge')) {
        replyText = "We deeply appreciate your patience. Duplicate charges are always credited back immediately once verified. Could you please upload a clear payment screenshot or provide the transaction billing code?";
      } else if (userText.toLowerCase().includes('login') || userText.toLowerCase().includes('password')) {
        replyText = "Understood. For login issue requests, our customer safety guidelines require you to verify your primary registered email. I have sent a fresh reset token request, please check if you receive it.";
      }

      setMessages(prev => [...prev, {
        id: `agent-reply-${Date.now()}`,
        sender: 'agent',
        senderName: 'Sarah (Support Agent)',
        text: replyText,
        timestamp: new Date().toISOString()
      }]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name);
    }
  };

  const handleEndChatConfirmed = () => {
    setShowEndConfirm(false);
    setChatState('ended');
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setChatState('closed');
      // Reset variables
      setRating(0);
      setFeedbackComment('');
      setFeedbackSubmitted(false);
    }, 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans" id="live-chat-panel">
      
      {/* State 1: Closed Button */}
      {chatState === 'closed' && (
        <button
          onClick={() => setChatState('welcome')}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xl px-5 py-3.5 rounded-full hover:scale-[1.03] transition-all duration-200 font-medium tracking-tight cursor-pointer"
          id="chat-toggle-button"
        >
          <MessageSquare className="h-5 w-5 shrink-0" />
          <span>Chat with us</span>
        </button>
      )}

      {/* Chat Container (States 2, 3, 4, 5) */}
      {chatState !== 'closed' && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col h-[520px] max-h-[calc(100vh-120px)] overflow-hidden transition-all duration-300">
          
          {/* Main Common Header */}
          <div className="bg-slate-900 text-white px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  SA
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-tight">Customer Support Chat</h3>
                <span className="text-[10px] text-slate-400 flex items-center">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block mr-1" />
                  Agents are online to assist
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-slate-400">
              <button 
                onClick={() => setChatState('closed')}
                className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Minimize chat"
              >
                <Minus className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => setChatState('closed')}
                className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
                title="Close chat"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* State 2: Welcome Screen */}
          {chatState === 'welcome' && (
            <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between bg-slate-50">
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-center">
                  <span className="text-2xl">👋</span>
                  <p className="font-semibold text-slate-800 mt-2 text-md">Hi, can we help today?</p>
                  <p className="text-xs text-slate-500 mt-1">Connect with our primary support specialist instantly.</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setChatState('prechat')}
                    className="w-full flex items-center justify-between text-left px-4 py-3 bg-white hover:bg-blue-50/40 border border-slate-100 rounded-xl transition-all hover:border-blue-100 group shadow-2xs"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800">Start a chat</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Response time: Usually 2-3 mins</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </button>

                  <button
                    onClick={() => {
                      setChatState('closed');
                      onNavigate('/customer/articles');
                    }}
                    className="w-full flex items-center justify-between text-left px-4 py-3 bg-white hover:bg-blue-50/40 border border-slate-100 rounded-xl transition-all hover:border-blue-100 group shadow-2xs"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800">Search help articles</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Browse 10+ self-serve user guides</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </button>

                  <button
                    onClick={() => {
                      setChatState('closed');
                      onNavigate('/customer/submit-ticket');
                    }}
                    className="w-full flex items-center justify-between text-left px-4 py-3 bg-white hover:bg-blue-50/40 border border-slate-100 rounded-xl transition-all hover:border-blue-100 group shadow-2xs"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800">Submit a support ticket</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Best for complex billing requests</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </button>
                </div>
              </div>

              <div className="text-center pt-4">
                <span className="text-[10px] text-slate-400 font-medium">Standard support session</span>
              </div>
            </div>
          )}

          {/* State 3: Pre-chat Form */}
          {chatState === 'prechat' && (
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
              <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-4">Support Pre-Chat Form</h4>
              <form onSubmit={handleStartChatFromPrechat} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={preChatForm.name}
                    onChange={e => setPreChatForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full block bg-white text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={preChatForm.email}
                    onChange={e => setPreChatForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full block bg-white text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">What can we help you with?</label>
                  <select
                    value={preChatForm.category}
                    onChange={e => setPreChatForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full block bg-white text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="Billing & Refunds">Billing & Refunds</option>
                    <option value="Account & Login">Account & Login</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Security Concern">Security Concern</option>
                    <option value="Product Question">Product Question</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Description</label>
                  <textarea
                    required
                    rows={2}
                    value={preChatForm.message}
                    onChange={e => setPreChatForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full block bg-white text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="How can we assist you today?..."
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setChatState('welcome')}
                    className="flex-1 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg py-2 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white text-xs font-semibold rounded-lg py-2 hover:bg-blue-700 transition"
                  >
                    Start Chat
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* State 4: Active Chat */}
          {chatState === 'active' && (
            <div className="flex-1 flex flex-col justify-between bg-slate-50 min-h-0">
              
              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => {
                  if (m.sender === 'system') {
                    return (
                      <div key={m.id} className="text-center">
                        <span className="inline-block text-[10px] text-slate-400 bg-slate-100 rounded-full px-2.5 py-0.5 border border-slate-200/50">
                          {m.text}
                        </span>
                      </div>
                    );
                  }

                  const isMe = m.sender === 'customer';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center space-x-1.5 mb-0.5">
                        <span className="text-[10px] font-semibold text-slate-400">
                          {isMe ? 'You' : m.senderName}
                        </span>
                        <span className="text-[8px] text-slate-300">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-3xs ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{m.text}</p>
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="mt-1.5 pt-1.5 border-t border-blue-500/30 flex items-center space-x-1 text-[10px] opacity-90">
                            <Paperclip className="h-3 w-3 shrink-0" />
                            <span className="truncate">{m.attachments[0]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-semibold text-slate-400 mb-0.5">
                      Sarah is typing...
                    </span>
                    <div className="bg-white text-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 border border-slate-100 shadow-3xs">
                      <div className="flex space-x-1 justify-center items-center h-2">
                        <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* End Chat Confirmation Dropup */}
              {showEndConfirm && (
                <div className="p-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-900 space-y-2">
                  <div className="flex items-start space-x-1.5">
                    <Info className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-semibold">End this support session?</p>
                      <p className="text-[11px] text-amber-700">This will close the active chat thread and let you rate our human agent support.</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 pt-1.5">
                    <button
                      onClick={() => setShowEndConfirm(false)}
                      className="flex-1 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-md font-semibold text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEndChatConfirmed}
                      className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-semibold"
                    >
                      End Chat
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              {!showEndConfirm && (
                <div className="bg-white border-t border-slate-100 px-3 py-2.5 flex flex-col space-y-1.5">
                  
                  {/* Selected attachment chip if any */}
                  {uploadedFileName && (
                    <div className="mx-1 py-1 px-2.5 bg-slate-50 text-slate-600 rounded-md text-[10px] flex items-center justify-between border border-slate-100">
                      <span className="truncate max-w-[200px] font-mono">Attachment: {uploadedFileName}</span>
                      <button onClick={() => setUploadedFileName(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center space-x-1">
                    {/* Attach Trigger */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      title="Attach receipt or file"
                    >
                      <Paperclip className="h-4.5 w-4.5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.csv"
                    />

                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 bg-slate-50 text-xs rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:bg-white focus:ring-1 focus:ring-blue-500 hover:bg-slate-100/75 transition-all block border-0"
                    />

                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() && !uploadedFileName}
                      className={`p-2.5 rounded-lg transition-all text-white ${
                        inputValue.trim() || uploadedFileName
                          ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                          : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] text-slate-400 font-medium">Pre-screened support feed</span>
                    <button
                      onClick={() => setShowEndConfirm(true)}
                      className="text-[10px] text-red-500 hover:text-red-600 font-semibold cursor-pointer"
                    >
                      End Chat
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* State 5: Ended, Rating experience */}
          {chatState === 'ended' && (
            <div className="flex-1 p-6 bg-slate-50 flex flex-col justify-center items-center text-center">
              {feedbackSubmitted ? (
                <div className="space-y-3.5">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                    ✓
                  </div>
                  <h4 className="font-semibold text-slate-800 text-md">Thank you for your rating!</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
                    Your valuable rating helps us fine-tune standard agent service queues.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-4 w-full">
                  <div className="text-3xl text-blue-600">✉</div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Please rate your support chat</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Let us know how your agent did today.</p>
                  </div>

                  {/* Stars input */}
                  <div className="flex justify-center space-x-2.5 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform active:scale-90"
                      >
                        <Star
                          className={`h-7 w-7 ${
                            star <= rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Comments */}
                  <div>
                    <textarea
                      rows={2}
                      value={feedbackComment}
                      onChange={e => setFeedbackComment(e.target.value)}
                      placeholder="Optional details or message..."
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setChatState('welcome')}
                      className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg py-2 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={rating === 0}
                      className={`flex-1 text-xs font-semibold rounded-lg py-2 transition-all ${
                        rating > 0
                          ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Submit Feedback
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

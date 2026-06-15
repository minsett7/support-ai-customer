import { useState } from 'react';
import { MessageSquare, Minus, X } from 'lucide-react';
import { useCustomerChat } from '../../hooks/useCustomerChat';
import ChatStartForm from './ChatStartForm';
import ChatWindow from './ChatWindow';

export default function CustomerLiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    startChat,
    sendMessage,
    closeChat,
    messages,
    sessionId,
    isConnected,
    isChatStarted,
    isLoading,
    error
  } = useCustomerChat();

  async function handleCloseChat() {
    await closeChat();
    setIsOpen(false);
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans" id="live-chat-panel">
      {!isOpen && (
        <button
          id="chat-toggle-button"
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xl transition hover:scale-[1.03] hover:bg-blue-700"
        >
          <MessageSquare className="h-5 w-5" />
          <span>Chat with us</span>
        </button>
      )}

      {isOpen && (
        <div className="flex h-[520px] max-h-[calc(100vh-120px)] w-80 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl sm:w-96">
          {!isChatStarted && (
            <>
              <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
                <div>
                  <h2 className="text-sm font-semibold">Customer Support Chat</h2>
                  <p className="text-[10px] text-slate-400">
                    {isConnected ? 'Ready for live support' : 'Connecting to chat server'}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded p-1 transition hover:bg-slate-800 hover:text-white"
                    title="Minimize chat"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded p-1 transition hover:bg-slate-800 hover:text-white"
                    title="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <ChatStartForm
                onStartChat={startChat}
                isLoading={isLoading}
                isConnected={isConnected}
                error={error}
              />
            </>
          )}

          {isChatStarted && (
            <ChatWindow
              sessionId={sessionId}
              messages={messages}
              isConnected={isConnected}
              error={error}
              onSendMessage={sendMessage}
              onCloseChat={handleCloseChat}
            />
          )}
        </div>
      )}
    </div>
  );
}

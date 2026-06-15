import { X } from 'lucide-react';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

export default function ChatWindow({
  sessionId,
  messages,
  isConnected,
  error,
  onSendMessage,
  onCloseChat
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-slate-100 bg-slate-900 px-4 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold tracking-tight">Live Support Chat</h3>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <span>{isConnected ? 'Connected' : 'Reconnecting'}</span>
            </div>
            <p className="mt-1 truncate font-mono text-[10px] text-slate-500" title={sessionId || ''}>
              Session: {sessionId}
            </p>
          </div>
          <button
            type="button"
            onClick={onCloseChat}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      <MessageList messages={messages} />
      <MessageInput onSendMessage={onSendMessage} disabled={!isConnected} />

      <div className="border-t border-slate-100 bg-white px-3 pb-3">
        <button
          type="button"
          onClick={onCloseChat}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Close Chat
        </button>
      </div>
    </div>
  );
}

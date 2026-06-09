import { useState } from 'react';
import { Send } from 'lucide-react';

export default function MessageInput({ onSendMessage, disabled = false }) {
  const [message, setMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    const cleanMessage = message.trim();
    if (!cleanMessage) {
      return;
    }

    onSendMessage(cleanMessage);
    setMessage('');
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-100 bg-white p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={disabled}
          className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-hidden transition placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:text-slate-400"
          placeholder="Type your message..."
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          title="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

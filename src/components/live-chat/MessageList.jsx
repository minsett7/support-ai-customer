import { useEffect, useRef } from 'react';

function formatTime(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function MessageList({ messages }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
      {messages.length === 0 && (
        <div className="flex h-full items-center justify-center text-center text-xs text-slate-400">
          Messages will appear here.
        </div>
      )}

      {messages.map((message) => {
        if (message.senderType === 'system') {
          return (
            <div key={message.id} className="text-center">
              <span className="inline-block rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-medium text-slate-500">
                {message.message}
              </span>
            </div>
          );
        }

        const isCustomer = message.senderType === 'customer';

        return (
          <div key={message.id} className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}>
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
              <span>{isCustomer ? 'You' : 'Support Agent'}</span>
              <span>{formatTime(message.createdAt)}</span>
            </div>
            <div
              className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-xs ${
                isCustomer
                  ? 'rounded-tr-none bg-blue-600 text-white'
                  : 'rounded-tl-none border border-slate-100 bg-white text-slate-800'
              }`}
            >
              {message.message}
            </div>
          </div>
        );
      })}

      <div ref={endRef} />
    </div>
  );
}

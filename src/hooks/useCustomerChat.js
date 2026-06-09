import { useCallback, useEffect, useRef, useState } from 'react';
import { createChatSession, closeChatSession } from '../lib/api';
import { createSocket } from '../lib/socket';

function createSystemMessage(message) {
  return {
    id: `system-${Date.now()}`,
    sessionId: null,
    senderType: 'system',
    senderId: null,
    message,
    createdAt: new Date().toISOString()
  };
}

function validateStartForm(formData) {
  if (!formData.customerFullName?.trim()) {
    throw new Error('Customer Full Name is required.');
  }

  if (!formData.category?.trim()) {
    throw new Error('Category is required.');
  }

  if (!formData.briefDescription?.trim()) {
    throw new Error('Brief Description is required.');
  }
}

export function useCustomerChat() {
  const socketRef = useRef(null);
  const sessionIdRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [chatStatus, setChatStatus] = useState('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    function handleConnect() {
      setIsConnected(true);
      setError('');

      if (sessionIdRef.current) {
        socket.emit('join_chat_session', {
          sessionId: sessionIdRef.current
        });
      }
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    function handleReceiveMessage(message) {
      setMessages((currentMessages) => {
        if (currentMessages.some((item) => item.id === message.id)) {
          return currentMessages;
        }

        return [...currentMessages, message];
      });
    }

    function handleJoinedChatSession(payload) {
      console.log('Joined chat session', payload);
    }

    function handleChatClosed() {
      setChatStatus('closed');
      setIsChatStarted(false);
      setSessionId(null);
      sessionIdRef.current = null;
      setMessages([]);
    }

    function handleSocketError(payload) {
      setError(payload?.message || 'Socket connection error.');
    }

    function handleConnectError() {
      setIsConnected(false);
      setError('Socket connection error. Please check that the backend is running.');
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('joined_chat_session', handleJoinedChatSession);
    socket.on('chat_closed', handleChatClosed);
    socket.on('socket_error', handleSocketError);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('joined_chat_session', handleJoinedChatSession);
      socket.off('chat_closed', handleChatClosed);
      socket.off('socket_error', handleSocketError);
      socket.off('connect_error', handleConnectError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const startChat = useCallback(async (formData) => {
    setError('');
    validateStartForm(formData);
    setIsLoading(true);

    try {
      const session = await createChatSession({
        customerFullName: formData.customerFullName.trim(),
        category: formData.category.trim(),
        briefDescription: formData.briefDescription.trim()
      });

      setSessionId(session.sessionId);
      sessionIdRef.current = session.sessionId;
      setChatStatus(session.status || 'waiting');
      setIsChatStarted(true);
      setMessages([
        {
          ...createSystemMessage('Chat started. Please wait for a support agent.'),
          sessionId: session.sessionId
        }
      ]);

      socketRef.current?.emit('join_chat_session', {
        sessionId: session.sessionId
      });
    } catch (error) {
      setError(error.message || 'Failed to create chat session.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback((message) => {
    const cleanMessage = message.trim();

    if (!cleanMessage || !sessionIdRef.current) {
      return;
    }

    socketRef.current?.emit('send_message', {
      sessionId: sessionIdRef.current,
      senderType: 'customer',
      senderId: null,
      message: cleanMessage
    });
  }, []);

  const closeChat = useCallback(async () => {
    if (!sessionIdRef.current) {
      setIsChatStarted(false);
      setMessages([]);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await closeChatSession(sessionIdRef.current);
      setSessionId(null);
      sessionIdRef.current = null;
      setMessages([]);
      setIsChatStarted(false);
      setChatStatus('closed');
    } catch (error) {
      setError(error.message || 'Failed to close chat.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    startChat,
    sendMessage,
    closeChat,
    messages,
    sessionId,
    isConnected,
    isChatStarted,
    chatStatus,
    isLoading,
    error
  };
}

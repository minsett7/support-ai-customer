const chatService = require('../services/chat.service');

function emitSocketError(socket, message) {
  socket.emit('socket_error', { message });
}

function registerChatSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_support_dashboard', () => {
      // TODO: Require support-agent auth before joining this room.
      socket.join('support_dashboard');
      socket.emit('joined_support_dashboard', {
        room: 'support_dashboard'
      });
    });

    socket.on('join_chat_session', async (payload = {}) => {
      try {
        // TODO: Add customer/support-agent authorization for session access.
        const { sessionId } = payload;

        if (!sessionId) {
          emitSocketError(socket, 'sessionId is required');
          return;
        }

        await chatService.getChatSessionById(sessionId);

        const room = `chat:${sessionId}`;
        socket.join(room);
        socket.emit('joined_chat_session', {
          sessionId,
          room
        });
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to join chat session');
      }
    });

    socket.on('send_message', async (payload = {}) => {
      try {
        const savedMessage = await chatService.createMessage({
          sessionId: payload.sessionId,
          senderType: payload.senderType,
          senderId: payload.senderId,
          message: payload.message
        });

        io.to(`chat:${savedMessage.sessionId}`).emit('receive_message', savedMessage);
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to send message');
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });
}

module.exports = registerChatSocket;

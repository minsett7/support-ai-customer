const chatService = require('../services/chat.service');
const ticketService = require('../services/ticket.service');
const { normalizeTrackingCode } = require('../utils/trackingCode');

function emitSocketError(socket, message) {
  socket.emit('socket_error', { message });
}

function registerChatSocket(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_support_dashboard', () => {
      // TODO: Require a verified support-agent JWT before joining this room.
      socket.join('support_dashboard');
      socket.emit('joined_support_dashboard', {
        room: 'support_dashboard'
      });
    });

    socket.on('join_chat_session', async (payload = {}) => {
      try {
        // TODO: Derive customer/agent identity from JWT auth instead of payload data.
        const { sessionId, agentId } = payload;

        if (!sessionId) {
          emitSocketError(socket, 'sessionId is required');
          return;
        }

        const session = await chatService.getChatSessionById(sessionId);

        if (session.status === 'closed') {
          emitSocketError(socket, 'Chat session is closed');
          return;
        }

        if (
          agentId &&
          session.status !== 'waiting' &&
          session.assignedAgentId !== agentId
        ) {
          emitSocketError(socket, 'Agent is not assigned to this chat session');
          return;
        }

        const room = `chat:${sessionId}`;
        socket.join(room);
        socket.emit('joined_chat_session', {
          sessionId,
          room,
          status: session.status,
          assignedAgentId: session.assignedAgentId
        });
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to join chat session');
      }
    });

    socket.on('send_message', async (payload = {}) => {
      try {
        // TODO: Derive senderType and senderId from verified JWT claims.
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

    socket.on('join_ticket_tracking', async (payload = {}) => {
      try {
        // Tracking codes act as bearer secrets in this MVP.
        // TODO: Add authenticated ticket ownership checks.
        const trackingCode = normalizeTrackingCode(payload.trackingCode);

        if (!trackingCode) {
          emitSocketError(socket, 'trackingCode is required');
          return;
        }

        const ticket = await ticketService.getTicketByTrackingCode(trackingCode);
        const room = `ticket:${ticket.trackingCode}`;

        socket.join(room);
        socket.emit('joined_ticket_tracking', {
          trackingCode: ticket.trackingCode,
          room,
          status: ticket.status
        });
      } catch (error) {
        emitSocketError(socket, error.message || 'Unable to join ticket tracking');
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });
}

module.exports = registerChatSocket;

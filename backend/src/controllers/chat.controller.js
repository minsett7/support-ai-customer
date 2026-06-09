const chatService = require('../services/chat.service');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../utils/errors');

function requireString(value, fieldName) {
  const cleanValue = typeof value === 'string' ? value.trim() : '';

  if (!cleanValue) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  return cleanValue;
}

const createChatSession = asyncHandler(async (req, res) => {
  // TODO: Add customer auth and rate limiting before exposing this publicly.
  const customerFullName = requireString(req.body.customerFullName, 'customerFullName');
  const category = requireString(req.body.category, 'category');
  const briefDescription = requireString(req.body.briefDescription, 'briefDescription');

  const session = await chatService.createChatSession({
    customerFullName,
    category,
    briefDescription
  });

  const io = req.app.get('io');
  io.to('support_dashboard').emit('new_chat_session', {
    sessionId: session.id,
    customerFullName: session.customerFullName,
    category: session.category,
    briefDescription: session.briefDescription,
    status: session.status,
    createdAt: session.createdAt
  });

  res.status(201).json({
    success: true,
    data: {
      sessionId: session.id,
      status: session.status
    }
  });
});

const getChatSession = asyncHandler(async (req, res) => {
  const session = await chatService.getChatSessionById(req.params.sessionId);

  res.json({
    success: true,
    data: session
  });
});

const getSessionMessages = asyncHandler(async (req, res) => {
  await chatService.getChatSessionById(req.params.sessionId);
  const messages = await chatService.getMessagesBySessionId(req.params.sessionId);

  res.json({
    success: true,
    data: messages
  });
});

const acceptChatSession = asyncHandler(async (req, res) => {
  // TODO: Replace body agentId with the agent ID from a verified JWT.
  // TODO: Add agent endpoint rate limiting and acceptance audit logs.
  const agentId = requireString(req.body.agentId, 'agentId');
  const session = await chatService.acceptChatSession(req.params.sessionId, agentId);
  const io = req.app.get('io');

  const payload = {
    sessionId: session.id,
    assignedAgentId: session.assignedAgentId,
    status: session.status
  };

  io.to('support_dashboard').emit('session_claimed', payload);
  io.to(`chat:${session.id}`).emit('chat_accepted', payload);

  res.json({
    success: true,
    data: session
  });
});

const closeChatSession = asyncHandler(async (req, res) => {
  // TODO: Require support-agent auth before allowing agents/admins to close chats.
  const session = await chatService.closeChatSession(req.params.sessionId);
  const io = req.app.get('io');

  io.to(`chat:${session.id}`).emit('chat_closed', {
    sessionId: session.id,
    status: session.status,
    closedAt: session.closedAt
  });

  res.json({
    success: true,
    data: session
  });
});

module.exports = {
  createChatSession,
  getChatSession,
  getSessionMessages,
  acceptChatSession,
  closeChatSession
};

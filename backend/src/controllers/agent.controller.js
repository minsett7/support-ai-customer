const chatService = require('../services/chat.service');
const asyncHandler = require('../utils/asyncHandler');

const getChatSessions = asyncHandler(async (req, res) => {
  // TODO: Require a verified support-agent JWT before exposing the queue.
  // TODO: Add rate limiting and Supabase RLS before production use.
  const status = req.query.status || 'waiting';
  const sessions = await chatService.getChatSessionsByStatus(status);

  res.json({
    success: true,
    data: sessions
  });
});

module.exports = {
  getChatSessions
};

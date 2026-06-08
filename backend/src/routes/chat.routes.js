const express = require('express');
const chatController = require('../controllers/chat.controller');

const router = express.Router();

router.post('/sessions', chatController.createChatSession);
router.get('/sessions/:sessionId', chatController.getChatSession);
router.get('/sessions/:sessionId/messages', chatController.getSessionMessages);
router.patch('/sessions/:sessionId/close', chatController.closeChatSession);

module.exports = router;

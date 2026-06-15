const express = require('express');
const agentController = require('../controllers/agent.controller');
const ticketController = require('../controllers/ticket.controller');

const router = express.Router();

router.get('/chat/sessions', agentController.getChatSessions);
router.get('/tickets', ticketController.getAgentTickets);

module.exports = router;

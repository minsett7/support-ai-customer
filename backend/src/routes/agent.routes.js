const express = require('express');
const agentController = require('../controllers/agent.controller');

const router = express.Router();

router.get('/sessions', agentController.getChatSessions);

module.exports = router;

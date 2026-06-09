const express = require('express');
const ticketController = require('../controllers/ticket.controller');

const router = express.Router();

router.post('/', ticketController.createTicket);
router.get('/track/:trackingCode', ticketController.trackTicket);
router.post('/:trackingCode/accept', ticketController.acceptTicket);
router.post('/:trackingCode/replies', ticketController.createAgentReply);
router.patch('/:trackingCode/status', ticketController.updateTicketStatus);

module.exports = router;

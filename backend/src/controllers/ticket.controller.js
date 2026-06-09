const ticketService = require('../services/ticket.service');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../utils/errors');
const { normalizeTrackingCode } = require('../utils/trackingCode');

function requireLimitedString(value, fieldName, maxLength) {
  const cleanValue = typeof value === 'string' ? value.trim() : '';

  if (!cleanValue) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  if (cleanValue.length > maxLength) {
    throw new AppError(`${fieldName} must be ${maxLength} characters or fewer`, 400);
  }

  return cleanValue;
}

function requirePriority(value) {
  const priority = requireLimitedString(value, 'priority', 20).toLowerCase();

  if (!['high', 'medium', 'low'].includes(priority)) {
    throw new AppError('priority must be high, medium, or low', 400);
  }

  return priority;
}

const createTicket = asyncHandler(async (req, res) => {
  // TODO: Add customer authentication, ownership checks, and rate limiting.
  const ticket = await ticketService.createTicket({
    customerFullName: requireLimitedString(req.body.customerFullName, 'customerFullName', 100),
    category: requireLimitedString(req.body.category, 'category', 80),
    priority: requirePriority(req.body.priority),
    subject: requireLimitedString(req.body.subject, 'subject', 150),
    description: requireLimitedString(req.body.description, 'description', 2000)
  });

  req.app.get('io').to('support_dashboard').emit('new_ticket', {
    trackingCode: ticket.trackingCode,
    customerFullName: ticket.customerFullName,
    category: ticket.category,
    priority: ticket.priority,
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    createdAt: ticket.createdAt
  });

  res.status(201).json({
    success: true,
    data: {
      trackingCode: ticket.trackingCode,
      status: ticket.status
    }
  });
});

const trackTicket = asyncHandler(async (req, res) => {
  // Tracking codes are bearer secrets in this MVP.
  // TODO: Add customer authentication and stricter ownership checks.
  const ticket = await ticketService.getPublicTicketByTrackingCode(req.params.trackingCode);

  res.json({
    success: true,
    data: ticket
  });
});

const getAgentTickets = asyncHandler(async (req, res) => {
  // TODO: Require a verified support-agent JWT and add rate limiting/RLS.
  const tickets = await ticketService.getTicketsByStatus(req.query.status || 'submitted');

  res.json({
    success: true,
    data: tickets
  });
});

const acceptTicket = asyncHandler(async (req, res) => {
  // TODO: Replace body agentId with the agent identity from a verified JWT.
  const agentId = requireLimitedString(req.body.agentId, 'agentId', 100);
  const ticket = await ticketService.acceptTicket(req.params.trackingCode, agentId);
  const payload = {
    trackingCode: ticket.trackingCode,
    assignedAgentId: ticket.assignedAgentId,
    status: ticket.status,
    acceptedAt: ticket.acceptedAt,
    updatedAt: ticket.updatedAt
  };
  const io = req.app.get('io');

  io.to(`ticket:${ticket.trackingCode}`).emit('ticket_accepted', payload);
  io.to('support_dashboard').emit('ticket_claimed', payload);

  res.json({
    success: true,
    data: ticket
  });
});

const updateTicketStatus = asyncHandler(async (req, res) => {
  // TODO: Require an authorized assigned agent and record an audit log.
  const status = requireLimitedString(req.body.status, 'status', 40).toLowerCase();
  const ticket = await ticketService.updateTicketStatus(req.params.trackingCode, status);
  const payload = {
    trackingCode: ticket.trackingCode,
    status: ticket.status,
    updatedAt: ticket.updatedAt,
    resolvedAt: ticket.resolvedAt,
    closedAt: ticket.closedAt
  };
  const io = req.app.get('io');

  io.to(`ticket:${ticket.trackingCode}`).emit('ticket_status_updated', payload);
  io.to('support_dashboard').emit('ticket_status_updated', payload);

  res.json({
    success: true,
    data: ticket
  });
});

const createAgentReply = asyncHandler(async (req, res) => {
  // TODO: Derive agent identity and name from verified JWT claims.
  const agentId = requireLimitedString(req.body.agentId, 'agentId', 100);
  const agentName = requireLimitedString(req.body.agentName, 'agentName', 100);
  const message = requireLimitedString(req.body.message, 'message', 4000);
  const status = req.body.status
    ? requireLimitedString(req.body.status, 'status', 40).toLowerCase()
    : undefined;
  const result = await ticketService.createAgentReply({
    trackingCode: req.params.trackingCode,
    agentId,
    agentName,
    message,
    status
  });
  const payload = {
    ...result.reply,
    status: result.ticket.status,
    updatedAt: result.ticket.updatedAt,
    resolvedAt: result.ticket.resolvedAt
  };
  const io = req.app.get('io');

  io.to(`ticket:${result.ticket.trackingCode}`).emit('ticket_reply', payload);
  io.to('support_dashboard').emit('ticket_reply', payload);

  if (result.ticket.status !== 'accepted') {
    const statusPayload = {
      trackingCode: result.ticket.trackingCode,
      status: result.ticket.status,
      updatedAt: result.ticket.updatedAt,
      resolvedAt: result.ticket.resolvedAt,
      closedAt: result.ticket.closedAt
    };

    io.to(`ticket:${result.ticket.trackingCode}`).emit(
      'ticket_status_updated',
      statusPayload
    );
    io.to('support_dashboard').emit('ticket_status_updated', statusPayload);
  }

  res.status(201).json({
    success: true,
    data: payload
  });
});

module.exports = {
  createTicket,
  trackTicket,
  getAgentTickets,
  acceptTicket,
  updateTicketStatus,
  createAgentReply
};

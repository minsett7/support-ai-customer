const supabase = require('../config/supabase');
const { AppError } = require('../utils/errors');
const { generateTrackingCode, normalizeTrackingCode } = require('../utils/trackingCode');

const ALLOWED_TICKET_STATUSES = new Set([
  'submitted',
  'accepted',
  'in_progress',
  'resolved',
  'closed'
]);
const UPDATABLE_TICKET_STATUSES = new Set(['in_progress', 'resolved', 'closed']);
const ALLOWED_TICKET_PRIORITIES = new Set(['high', 'medium', 'low']);
const REPLY_TICKET_STATUSES = new Set(['in_progress', 'resolved']);
const MAX_TRACKING_CODE_ATTEMPTS = 5;

function mapTicket(row) {
  return {
    id: row.id,
    trackingCode: row.tracking_code,
    customerFullName: row.customer_full_name,
    category: row.category,
    priority: row.priority,
    subject: row.subject,
    description: row.description,
    status: row.status,
    assignedAgentId: row.assigned_agent_id,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
    closedAt: row.closed_at
  };
}

function mapPublicTicket(row) {
  return {
    trackingCode: row.tracking_code,
    customerFullName: row.customer_full_name,
    category: row.category,
    priority: row.priority,
    subject: row.subject,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at,
    closedAt: row.closed_at
  };
}

function mapTicketReply(row) {
  return {
    id: row.id,
    trackingCode: row.tracking_code,
    senderType: row.sender_type,
    senderId: row.sender_id,
    senderName: row.sender_name,
    message: row.message,
    createdAt: row.created_at
  };
}

function throwDatabaseError(error) {
  console.error('Ticket database error:', error);
  throw new AppError('Unable to process ticket request', 500);
}

async function createTicket({ customerFullName, category, priority, subject, description }) {
  if (!ALLOWED_TICKET_PRIORITIES.has(priority)) {
    throw new AppError('priority must be high, medium, or low', 400);
  }

  for (let attempt = 0; attempt < MAX_TRACKING_CODE_ATTEMPTS; attempt += 1) {
    const trackingCode = generateTrackingCode();
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        tracking_code: trackingCode,
        customer_full_name: customerFullName,
        category,
        priority,
        subject,
        description,
        status: 'submitted'
      })
      .select('*')
      .single();

    if (!error && data) {
      return mapTicket(data);
    }

    if (error?.code !== '23505') {
      throwDatabaseError(error);
    }
  }

  throw new AppError('Unable to generate a unique tracking code', 500);
}

async function getTicketByTrackingCode(trackingCode) {
  const normalizedCode = normalizeTrackingCode(trackingCode);
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('tracking_code', normalizedCode)
    .maybeSingle();

  if (error) {
    throwDatabaseError(error);
  }

  if (!data) {
    throw new AppError('Ticket not found', 404);
  }

  return mapTicket(data);
}

async function getPublicTicketByTrackingCode(trackingCode) {
  const normalizedCode = normalizeTrackingCode(trackingCode);
  const { data, error } = await supabase
    .from('support_tickets')
    .select(
      'id, tracking_code, customer_full_name, category, priority, subject, description, status, created_at, accepted_at, updated_at, resolved_at, closed_at'
    )
    .eq('tracking_code', normalizedCode)
    .maybeSingle();

  if (error) {
    throwDatabaseError(error);
  }

  if (!data) {
    throw new AppError('Ticket not found', 404);
  }

  const { data: replies, error: repliesError } = await supabase
    .from('support_ticket_replies')
    .select('*')
    .eq('ticket_id', data.id)
    .order('created_at', { ascending: true });

  if (repliesError) {
    throwDatabaseError(repliesError);
  }

  return {
    ...mapPublicTicket(data),
    replies: replies.map(mapTicketReply)
  };
}

async function getTicketsByStatus(status = 'submitted') {
  if (!ALLOWED_TICKET_STATUSES.has(status)) {
    throw new AppError(
      'status must be submitted, accepted, in_progress, resolved, or closed',
      400
    );
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: true });

  if (error) {
    throwDatabaseError(error);
  }

  return data.map(mapTicket);
}

async function acceptTicket(trackingCode, agentId) {
  const normalizedCode = normalizeTrackingCode(trackingCode);
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('support_tickets')
    .update({
      status: 'accepted',
      assigned_agent_id: agentId,
      accepted_at: now,
      updated_at: now
    })
    .eq('tracking_code', normalizedCode)
    .eq('status', 'submitted')
    .is('assigned_agent_id', null)
    .select('*')
    .maybeSingle();

  if (error) {
    throwDatabaseError(error);
  }

  if (!data) {
    throw new AppError('Ticket already accepted', 409);
  }

  // TODO: Add an audit log recording the accepting agent and timestamp.
  return mapTicket(data);
}

async function updateTicketStatus(trackingCode, status) {
  if (!UPDATABLE_TICKET_STATUSES.has(status)) {
    throw new AppError('status must be in_progress, resolved, or closed', 400);
  }

  const normalizedCode = normalizeTrackingCode(trackingCode);
  const now = new Date().toISOString();
  const updates = {
    status,
    updated_at: now
  };

  if (status === 'resolved') {
    updates.resolved_at = now;
  }

  if (status === 'closed') {
    updates.closed_at = now;
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('tracking_code', normalizedCode)
    .select('*')
    .maybeSingle();

  if (error) {
    throwDatabaseError(error);
  }

  if (!data) {
    throw new AppError('Ticket not found', 404);
  }

  // TODO: Add an audit log for status transitions.
  return mapTicket(data);
}

async function createAgentReply({
  trackingCode,
  agentId,
  agentName,
  message,
  status
}) {
  if (status && !REPLY_TICKET_STATUSES.has(status)) {
    throw new AppError('status must be in_progress or resolved', 400);
  }

  const ticket = await getTicketByTrackingCode(trackingCode);

  if (ticket.status === 'submitted') {
    throw new AppError('Ticket must be accepted before an agent can reply', 409);
  }

  if (ticket.status === 'closed') {
    throw new AppError('Closed tickets cannot receive replies', 409);
  }

  if (ticket.assignedAgentId !== agentId) {
    throw new AppError('Agent is not assigned to this ticket', 403);
  }

  const nextStatus = status || (ticket.status === 'accepted' ? 'in_progress' : ticket.status);
  const now = new Date().toISOString();
  const updates = {
    status: nextStatus,
    updated_at: now
  };

  if (nextStatus === 'resolved') {
    updates.resolved_at = now;
  }

  const { data: reply, error: replyError } = await supabase
    .from('support_ticket_replies')
    .insert({
      ticket_id: ticket.id,
      tracking_code: ticket.trackingCode,
      sender_type: 'agent',
      sender_id: agentId,
      sender_name: agentName,
      message
    })
    .select('*')
    .single();

  if (replyError) {
    throwDatabaseError(replyError);
  }

  const { data: updatedTicket, error: updateError } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', ticket.id)
    .select('*')
    .single();

  if (updateError) {
    throwDatabaseError(updateError);
  }

  // TODO: Move reply insertion and status update into one PostgreSQL transaction/RPC.
  // TODO: Record an audit event for the agent reply and status transition.
  return {
    reply: mapTicketReply(reply),
    ticket: mapTicket(updatedTicket)
  };
}

async function createCustomerReply({ trackingCode, message }) {
  const ticket = await getTicketByTrackingCode(trackingCode);

  if (ticket.status === 'closed') {
    throw new AppError('Closed tickets cannot receive replies', 409);
  }

  const nextStatus =
    ticket.status === 'submitted' ? 'submitted' : 'in_progress';
  const now = new Date().toISOString();
  const updates = {
    status: nextStatus,
    updated_at: now
  };

  if (ticket.status === 'resolved') {
    updates.resolved_at = null;
  }

  const { data: reply, error: replyError } = await supabase
    .from('support_ticket_replies')
    .insert({
      ticket_id: ticket.id,
      tracking_code: ticket.trackingCode,
      sender_type: 'customer',
      sender_id: null,
      sender_name: ticket.customerFullName,
      message
    })
    .select('*')
    .single();

  if (replyError) {
    throwDatabaseError(replyError);
  }

  const { data: updatedTicket, error: updateError } = await supabase
    .from('support_tickets')
    .update(updates)
    .eq('id', ticket.id)
    .select('*')
    .single();

  if (updateError) {
    throwDatabaseError(updateError);
  }

  // TODO: Move reply insertion and status update into one PostgreSQL transaction/RPC.
  // TODO: Authenticate the customer and verify ticket ownership.
  return {
    reply: mapTicketReply(reply),
    ticket: mapTicket(updatedTicket)
  };
}

module.exports = {
  createTicket,
  getTicketByTrackingCode,
  getPublicTicketByTrackingCode,
  getTicketsByStatus,
  acceptTicket,
  updateTicketStatus,
  createAgentReply,
  createCustomerReply
};

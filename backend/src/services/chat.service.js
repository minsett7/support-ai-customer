const supabase = require('../config/supabase');
const { AppError } = require('../utils/errors');

const ALLOWED_SENDER_TYPES = new Set(['customer', 'agent', 'system']);
const ALLOWED_SESSION_STATUSES = new Set(['waiting', 'accepted', 'closed']);
const MAX_ACTIVE_CHATS_PER_AGENT = 3;

function mapSession(row) {
  return {
    id: row.id,
    customerFullName: row.customer_full_name,
    category: row.category,
    briefDescription: row.brief_description,
    status: row.status,
    assignedAgentId: row.assigned_agent_id,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
    updatedAt: row.updated_at,
    closedAt: row.closed_at
  };
}

function mapMessage(row) {
  return {
    id: row.id,
    sessionId: row.session_id,
    senderType: row.sender_type,
    senderId: row.sender_id,
    message: row.message,
    createdAt: row.created_at
  };
}

function normalizeRequiredString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

async function createChatSession({ customerFullName, category, briefDescription }) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      customer_full_name: normalizeRequiredString(customerFullName),
      category: normalizeRequiredString(category),
      brief_description: normalizeRequiredString(briefDescription),
      status: 'waiting'
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return mapSession(data);
}

async function getChatSessionById(sessionId) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error || !data) {
    throw new AppError('Chat session not found', 404);
  }

  return mapSession(data);
}

async function getChatSessionsByStatus(status = 'waiting') {
  if (!ALLOWED_SESSION_STATUSES.has(status)) {
    throw new AppError('status must be waiting, accepted, or closed', 400);
  }

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: true });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data.map(mapSession);
}

async function getMessagesBySessionId(sessionId) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data.map(mapMessage);
}

async function createMessage({ sessionId, senderType, senderId = null, message }) {
  const cleanMessage = normalizeRequiredString(message);

  if (!sessionId) {
    throw new AppError('sessionId is required', 400);
  }

  if (!ALLOWED_SENDER_TYPES.has(senderType)) {
    throw new AppError('senderType must be customer, agent, or system', 400);
  }

  if (!cleanMessage) {
    throw new AppError('message is required', 400);
  }

  const session = await getChatSessionById(sessionId);

  if (session.status === 'closed') {
    throw new AppError('Chat session is closed', 400);
  }

  if (senderType === 'agent') {
    const cleanSenderId = normalizeRequiredString(senderId);

    if (!cleanSenderId) {
      throw new AppError('senderId is required for agent messages', 400);
    }

    if (session.assignedAgentId !== cleanSenderId) {
      throw new AppError('Agent is not assigned to this chat session', 403);
    }
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      sender_type: senderType,
      sender_id: senderId || null,
      message: cleanMessage
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return mapMessage(data);
}

async function acceptChatSession(sessionId, agentId) {
  const cleanAgentId = normalizeRequiredString(agentId);

  if (!cleanAgentId) {
    throw new AppError('agentId is required', 400);
  }

  const { count, error: countError } = await supabase
    .from('chat_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'accepted')
    .eq('assigned_agent_id', cleanAgentId);

  if (countError) {
    throw new AppError(countError.message, 500);
  }

  if ((count || 0) >= MAX_ACTIVE_CHATS_PER_AGENT) {
    throw new AppError('Agent has reached maximum active chats', 409);
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('chat_sessions')
    .update({
      status: 'accepted',
      assigned_agent_id: cleanAgentId,
      accepted_at: now,
      updated_at: now
    })
    .eq('id', sessionId)
    .eq('status', 'waiting')
    .is('assigned_agent_id', null)
    .select('*')
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!data) {
    throw new AppError('Chat already accepted', 409);
  }

  // TODO: Add an audit log recording who accepted the session.
  return mapSession(data);
}

async function closeChatSession(sessionId) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('chat_sessions')
    .update({
      status: 'closed',
      closed_at: now,
      updated_at: now
    })
    .eq('id', sessionId)
    .select('*')
    .single();

  if (error || !data) {
    throw new AppError('Chat session not found', 404);
  }

  return mapSession(data);
}

module.exports = {
  MAX_ACTIVE_CHATS_PER_AGENT,
  createChatSession,
  getChatSessionById,
  getChatSessionsByStatus,
  getMessagesBySessionId,
  createMessage,
  acceptChatSession,
  closeChatSession
};

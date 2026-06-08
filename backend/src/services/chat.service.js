const supabase = require('../config/supabase');
const { AppError } = require('../utils/errors');

const ALLOWED_SENDER_TYPES = new Set(['customer', 'agent', 'system']);

function mapSession(row) {
  return {
    id: row.id,
    customerFullName: row.customer_full_name,
    category: row.category,
    briefDescription: row.brief_description,
    status: row.status,
    assignedAgentId: row.assigned_agent_id,
    createdAt: row.created_at,
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

  await getChatSessionById(sessionId);

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
  createChatSession,
  getChatSessionById,
  getMessagesBySessionId,
  createMessage,
  closeChatSession
};

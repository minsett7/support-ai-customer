# Support Chat Backend

Node.js, Express, Socket.IO, and Supabase backend for live customer support chat.

## Setup

Install dependencies:

```bash
cd backend
npm install
```

Create an environment file:

```bash
cp .env.example .env
```

Set these values in `.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=http://localhost:3000
PORT=5000
```

The service role key must stay on the backend only. Do not expose it in the customer dashboard.

## Run

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Health check:

```text
GET http://localhost:5000/health
```

## API

### Create Chat Session

```text
POST /api/chat/sessions
```

Request:

```json
{
  "customerFullName": "Mg Mg",
  "category": "Account Issue",
  "briefDescription": "I cannot login to my account"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "status": "waiting"
  }
}
```

This emits `new_chat_session` to the `support_dashboard` Socket.IO room.

### Get Chat Session

```text
GET /api/chat/sessions/:sessionId
```

### Get Session Messages

```text
GET /api/chat/sessions/:sessionId/messages
```

Messages are returned in `created_at` ascending order.

### Close Chat Session

```text
PATCH /api/chat/sessions/:sessionId/close
```

This updates the session to `closed`, sets `closed_at`, and emits `chat_closed` to only:

```text
chat:{sessionId}
```

API errors use:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Socket.IO Events

Connect to:

```text
http://localhost:5000
```

### Join Customer Chat Session

Client emits:

```js
socket.emit('join_chat_session', {
  sessionId: 'session-uuid'
});
```

Server emits back:

```js
socket.on('joined_chat_session', (payload) => {
  console.log(payload.sessionId, payload.room);
});
```

### Send Message

Customer client emits:

```js
socket.emit('send_message', {
  sessionId: 'session-uuid',
  senderType: 'customer',
  senderId: 'customer-temp-id-or-null',
  message: 'Hello, I need help'
});
```

Support dashboard can use the same event with:

```js
socket.emit('send_message', {
  sessionId: 'session-uuid',
  senderType: 'agent',
  senderId: 'agent-id',
  message: 'Hi, I can help you.'
});
```

Server emits to only the chat room `chat:{sessionId}`:

```js
socket.on('receive_message', (message) => {
  console.log(message);
});
```

Payload:

```json
{
  "id": "message-uuid",
  "sessionId": "session-uuid",
  "senderType": "customer",
  "senderId": "customer-temp-id-or-null",
  "message": "Hello, I need help",
  "createdAt": "2026-06-08T00:00:00.000Z"
}
```

### Join Support Dashboard

Support dashboard emits:

```js
socket.emit('join_support_dashboard');
```

Server joins the socket to:

```text
support_dashboard
```

New sessions emit only to that room:

```js
socket.on('new_chat_session', (session) => {
  console.log(session);
});
```

### Socket Errors

```js
socket.on('socket_error', (error) => {
  console.error(error.message);
});
```

Payload:

```json
{
  "message": "Error message here"
}
```

## Supabase SQL

Run this SQL in the Supabase SQL editor:

```sql
create extension if not exists pgcrypto;

create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  customer_full_name text not null,
  category text not null,
  brief_description text not null,
  status text not null default 'waiting',
  assigned_agent_id uuid null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  closed_at timestamp with time zone null
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id) on delete cascade,
  sender_type text not null,
  sender_id text null,
  message text not null,
  created_at timestamp with time zone default now()
);

alter table chat_sessions
  add constraint chat_sessions_status_check
  check (status in ('waiting', 'accepted', 'closed'));

alter table chat_messages
  add constraint chat_messages_sender_type_check
  check (sender_type in ('customer', 'agent', 'system'));

create index if not exists idx_chat_messages_session_created_at
  on chat_messages (session_id, created_at);

create index if not exists idx_chat_sessions_status_created_at
  on chat_sessions (status, created_at);
```

## MVP Security Notes

This backend is intentionally simple for MVP integration.

Before production, add:

- Customer authentication before creating or joining customer chat sessions.
- Support agent authentication before joining `support_dashboard`, replying as `agent`, assigning sessions, or closing chats.
- Supabase Row Level Security policies for customer and agent access.
- Rate limiting on session creation and message sending.
- Input size limits and abuse monitoring.

Messages are never emitted globally. Chat messages and `chat_closed` are sent only to `chat:{sessionId}`. New session notifications are sent only to `support_dashboard`.

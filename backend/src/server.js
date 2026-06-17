require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const chatRoutes = require('./routes/chat.routes');
const agentRoutes = require('./routes/agent.routes');
const ticketRoutes = require('./routes/ticket.routes');
const helpArticleRoutes = require('./routes/helpArticle.routes');
const registerChatSocket = require('./sockets/chat.socket');
const { notFoundHandler, errorHandler } = require('./utils/errors');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.SUPPORT_FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

const io = new Server(server, {
  cors: corsOptions
});

// TODO: Add a Redis adapter when the backend is deployed across multiple instances.
app.set('io', io);

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Support chat backend is running'
  });
});

app.use('/api/chat', chatRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/help-articles', helpArticleRoutes);

registerChatSocket(io);

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Support chat backend listening on port ${port}`);
});

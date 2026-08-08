const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { initDb } = require('../database/db');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Attach io to app
app.set('io', io);

// API Routes
app.use('/api', apiRoutes);

// Socket.io Realtime connection
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  
  socket.on('join_program_room', (programId) => {
    socket.join(`program_${programId}`);
    console.log(`[Socket.io] Client ${socket.id} joined program_${programId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

// Initialize DB and start HTTP server
initDb().then(() => {
  server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` Madrasa Milad Management System Backend Running  `);
    console.log(` Server URL: http://localhost:${PORT}             `);
    console.log(` Socket.IO: WebSocket broadcast ready             `);
    console.log(` Database: SQLite auto-seeded & MySQL ready       `);
    console.log(`===================================================`);
  });
}).catch(err => {
  console.error('[DB Error] Failed to initialize database:', err);
});

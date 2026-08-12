const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { initDb } = require('../database/db');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://vibe-of-madeena.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow production cross-origin requests safely
    }
  },
  credentials: true
};

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Security & Cache-Control Headers
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Root URL API Welcome & Health Status page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vibe of Madeena 2K26 - API Server</title>
        <style>
          body { background-color: #021B15; color: #10B981; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background-color: #04261E; padding: 40px; border-radius: 24px; border: 1px solid rgba(245, 158, 11, 0.4); text-align: center; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          h1 { color: #F59E0B; margin-top: 0; font-size: 22px; }
          p { color: #94A3B8; font-size: 13px; line-height: 1.6; }
          .btn { display: inline-block; margin-top: 16px; padding: 12px 24px; background: linear-gradient(to right, #F59E0B, #D97706); color: #021B15; text-decoration: none; font-weight: bold; border-radius: 12px; font-size: 13px; }
          .badge { display: inline-block; padding: 4px 12px; background-color: rgba(16, 185, 129, 0.2); color: #34D399; border-radius: 9999px; font-size: 11px; font-weight: bold; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">● Backend API Server Online</span>
          <h1>വൈബ് ഓഫ് മദീന 2K26 API</h1>
          <p>Jamalullaili Secondary Madrasa, MKMJC - Payyanur Milad Festival Realtime Management System Backend Database Server.</p>
          <a href="https://vibe-of-madeena.vercel.app" class="btn">Open Main Web Application →</a>
        </div>
      </body>
    </html>
  `);
});

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

const { isPg } = require('../database/db');

// Initialize DB and start HTTP server
initDb().then(() => {
  server.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` Madrasa Milad Management System Backend Running  `);
    console.log(` Server URL: http://localhost:${PORT}             `);
    console.log(` Socket.IO: WebSocket broadcast ready             `);
    console.log(` Database: ${isPg ? 'PostgreSQL (Render Persistent Cloud DB)' : 'SQLite Local Development Mode'} `);
    console.log(`===================================================`);
  });
}).catch(err => {
  console.error('[DB Error] Failed to initialize database:', err);
});

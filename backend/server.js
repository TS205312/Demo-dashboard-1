import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { connectDatabase, closeDatabase, seedDatabase } from './database.js';
import { initWebSocketServer } from './websocket.js';
import authRoutes from './routes/auth.js';
import ordersRoutes from './routes/orders.js';
import dronesRoutes from './routes/drones.js';
import missionsRoutes from './routes/missions.js';
import gcsRoutes from './routes/gcs.js';
import Order from './models/Order.js';

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sah_tech';
const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'];

// ===================================================================
// INITIALIZE DATABASE
// ===================================================================
try {
  await connectDatabase();
  await seedDatabase();
  console.log('✅ Database initialized and seeded');
} catch (err) {
  console.error('❌ Failed to initialize database:', err.message);
  process.exit(1);
}

const app = express();
const server = createServer(app);

// ===================================================================
// MIDDLEWARE
// ===================================================================
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// ===================================================================
// REST API ROUTES
// ===================================================================
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/drones', dronesRoutes);
app.use('/api/missions', missionsRoutes);
app.use('/api/gcs', gcsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SAH-TECH GCS Server v3.0 is running',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb_uri: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
  });
});

// ===================================================================
// GCS WEBSOCKET ENGINE (Mission Planner style)
// ===================================================================
const wss = initWebSocketServer(server);
app.set('wss', wss);
console.log('✅ GCS WebSocket Engine active on path /ws');

// ===================================================================
// ORDER AUTO-PROGRESSION (simulate status changes over time)
// ===================================================================
setInterval(async () => {
  try {
    const now = Date.now();
    const activeOrders = await Order.find({
      status: { $nin: ['delivered', 'cancelled'] }
    });

    for (const order of activeOrders) {
      const createdTime = new Date(order.createdAt).getTime();
      const elapsedSec = (now - createdTime) / 1000;
      let newStatus = null;

      if (elapsedSec > 30 && order.status === 'pending') newStatus = 'packaging';
      else if (elapsedSec > 40 && order.status === 'packaging') newStatus = 'departed';
      else if (elapsedSec > 50 && order.status === 'departed') newStatus = 'inflight';
      else if (elapsedSec > 60 && order.status === 'inflight') newStatus = 'delivered';

      if (newStatus) {
        order.status = newStatus;
        await order.save();
        console.log(`[AUTO] Order ${order.code} -> ${newStatus}`);
      }
    }
  } catch (err) {
    // Silent
  }
}, 5000);

// ===================================================================
// START SERVER
// ===================================================================
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║       SAH-TECH GCS Server v3.0                           ║
║     (Ground Control Station - Mission Planner)           ║
╠══════════════════════════════════════════════════════════╣
║  REST API:   http://0.0.0.0:${PORT}/api                  ║
║  WebSocket:  ws://0.0.0.0:${PORT}/ws                     ║
║  GCS Status: http://0.0.0.0:${PORT}/api/gcs/status       ║
║  Health:     http://0.0.0.0:${PORT}/api/health           ║
║  MongoDB:    ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}
╠══════════════════════════════════════════════════════════╣
║  GCS Features:                                           ║
║    • Drone registration (REGISTER_DRONE)                  ║
║    • Dashboard registration (REGISTER_DASHBOARD)          ║
║    • Real-time telemetry broadcast (DRONE_TELEMETRY)      ║
║    • Bi-directional command routing                       ║
║    • Auto-failsafe (battery < 15% -> RTL)                ║
║    • Ping/Pong heartbeat (30s)                            ║
║    • Telemetry timeout detection                          ║
╠══════════════════════════════════════════════════════════╣
║  CORS origins:                                           ║
${CORS_ORIGINS.map(o => `║    - ${o}`).join('\n')}
╚══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  await closeDatabase();
  server.close(() => process.exit(0));
});
process.on('SIGTERM', async () => {
  console.log('\nShutting down server...');
  await closeDatabase();
  server.close(() => process.exit(0));
});

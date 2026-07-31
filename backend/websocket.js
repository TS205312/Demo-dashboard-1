/**
 * ===================================================================
 * GCS WEBSOCKET ENGINE - SAH-TECH Ground Control Station
 * ===================================================================
 * Mission Planner style WebSocket server for UAV command & control
 * 
 * Features:
 * - Drone registration & de-registration (In-memory Map for speed)
 * - Dashboard subscription for real-time telemetry broadcast
 * - Bi-directional command routing (Dashboard → Drone)
 * - Auto-failsafe: low battery → COMMAND_RTL
 * - Ping/Pong heartbeat keep-alive
 * - Waypoint upload forwarding
 * ===================================================================
 */

import { WebSocketServer } from 'ws';

// ===================================================================
// IN-MEMORY DRONE STORE (RAM-based, super fast)
// ===================================================================
/** 
 * Map<droneId, { ws: WebSocket, telemetry: Object, lastSeen: Date, isRegistered: boolean }>
 */
const connectedDrones = new Map();

/**
 * Map<dashboardClientId, WebSocket>
 */
const connectedDashboards = new Map();

let dashboardIdCounter = 0;
let broadcastFn = null; // Will be set after WSS creation

// ===================================================================
// HELPER: Create timestamped message
// ===================================================================
function createMessage(type, data) {
  return JSON.stringify({ type, data, timestamp: new Date().toISOString() });
}

// ===================================================================
// HELPER: Send to a specific WebSocket safely
// ===================================================================
function sendSafe(ws, message) {
  try {
    if (ws && ws.readyState === 1) { // WebSocket.OPEN
      ws.send(typeof message === 'string' ? message : JSON.stringify(message));
    }
  } catch (err) {
    // Silent - connection may have dropped
  }
}

// ===================================================================
// HELPER: Broadcast to all dashboards
// ===================================================================
function broadcastToDashboards(type, data) {
  const msg = createMessage(type, data);
  connectedDashboards.forEach((ws) => {
    sendSafe(ws, msg);
  });
}

// ===================================================================
// HELPER: Broadcast to all (drones + dashboards)
// ===================================================================
function broadcastAll(type, data) {
  const msg = createMessage(type, data);
  
  connectedDrones.forEach((entry) => {
    sendSafe(entry.ws, msg);
  });
  
  connectedDashboards.forEach((ws) => {
    sendSafe(ws, msg);
  });
}

// ===================================================================
// FAILSAFE CHECK: Low battery auto-RTL
// ===================================================================
function checkFailsafe(droneId, telemetry) {
  const entry = connectedDrones.get(droneId);
  if (!entry) return;

  const { battery } = telemetry;
  const currentMode = telemetry.mode || entry.telemetry?.mode || 'STABILIZE';

  // Auto RTL: battery < 15% AND in AUTO mode
  if (battery < 15 && currentMode === 'AUTO') {
    console.log(`[FAILSAFE] ${droneId}: Battery ${battery}% < 15% in AUTO mode → Auto-RTL triggered!`);
    
    // Send COMMAND_RTL to the drone
    sendSafe(entry.ws, createMessage('COMMAND_RTL', {
      droneId,
      reason: 'LOW_BATTERY_CRITICAL',
      message: `Pin chỉ còn ${battery}%. Drone tự động quay về!`,
      timestamp: new Date().toISOString(),
    }));

    // Broadcast ALERT to all dashboards
    broadcastToDashboards('ALERT', {
      type: 'FAILSAFE_RTL',
      droneId,
      severity: 'CRITICAL',
      message: `🚨 FAILSAFE: Drone ${droneId} pin ${battery}% - Tự động RTL!`,
      telemetry: { ...telemetry, mode: 'RTL' },
      timestamp: new Date().toISOString(),
    });

    // Update in-memory telemetry mode
    if (entry.telemetry) {
      entry.telemetry.mode = 'RTL';
    }
  }

  // Low battery warning at 25%
  if (battery >= 15 && battery < 25 && currentMode === 'AUTO') {
    broadcastToDashboards('ALERT', {
      type: 'LOW_BATTERY_WARNING',
      droneId,
      severity: 'WARNING',
      message: `⚠️ Drone ${droneId}: Pin còn ${battery}% - Chuẩn bị RTL`,
      timestamp: new Date().toISOString(),
    });
  }
}

// ===================================================================
// PROCESS INCOMING MESSAGE
// ===================================================================
function processMessage(ws, raw, isDrone) {
  try {
    const msg = JSON.parse(raw.toString());
    const { type, data } = msg;

    if (!type) return;

    switch (type) {
      // ============================================
      // PING / PONG (Keep Alive)
      // ============================================
      case 'PING':
        sendSafe(ws, createMessage('PONG', {}));
        break;

      // ============================================
      // DRONE REGISTRATION (from UAV hardware)
      // ============================================
      case 'REGISTER_DRONE': {
        if (!data || !data.droneId) break;
        const droneId = data.droneId;
        
        connectedDrones.set(droneId, {
          ws,
          telemetry: data.telemetry || {},
          lastSeen: new Date(),
          isRegistered: true,
          connectedAt: new Date(),
        });

        console.log(`[GCS] 🛸 Drone registered: ${droneId}`);

        // Confirm to drone
        sendSafe(ws, createMessage('REGISTER_DRONE_ACK', {
          droneId,
          status: 'registered',
          message: 'Drone registered to GCS successfully',
        }));

        // Notify all dashboards
        broadcastToDashboards('DRONE_CONNECTED', {
          droneId,
          telemetry: data.telemetry || {},
          timestamp: new Date().toISOString(),
        });

        break;
      }

      // ============================================
      // DASHBOARD REGISTRATION (from User/Staff web UI)
      // ============================================
      case 'REGISTER_DASHBOARD': {
        const dashboardId = `dashboard_${++dashboardIdCounter}`;
        connectedDashboards.set(dashboardId, ws);
        
        // Store dashboardId on ws for cleanup
        ws._dashboardId = dashboardId;

        console.log(`[GCS] 🖥️ Dashboard registered: ${dashboardId}`);

        // Send list of all currently connected drones
        const activeDrones = [];
        connectedDrones.forEach((entry, id) => {
          activeDrones.push({
            droneId: id,
            telemetry: entry.telemetry,
            connectedAt: entry.connectedAt,
            lastSeen: entry.lastSeen,
          });
        });

        sendSafe(ws, createMessage('DASHBOARD_REGISTERED', {
          dashboardId,
          message: 'Dashboard connected to GCS',
          activeDrones,
          droneCount: activeDrones.length,
        }));

        break;
      }

      // ============================================
      // DRONE TELEMETRY UPDATE (from UAV hardware)
      // ============================================
      case 'DRONE_TELEMETRY': {
        if (!data || !data.droneId) break;
        const { droneId } = data;

        const entry = connectedDrones.get(droneId);
        if (!entry) break;

        // Update in-memory telemetry (RAM - super fast)
        entry.telemetry = { ...entry.telemetry, ...data };
        entry.lastSeen = new Date();

        // Broadcast telemetry to all dashboards immediately
        broadcastToDashboards('DRONE_TELEMETRY', {
          droneId,
          telemetry: entry.telemetry,
          timestamp: new Date().toISOString(),
        });

        // Failsafe check
        checkFailsafe(droneId, data);

        break;
      }

      // ============================================
      // COMMAND ROUTING: Dashboard → Drone
      // ============================================
      case 'COMMAND_TAKEOFF':
      case 'COMMAND_RTL':
      case 'COMMAND_LAND':
      case 'COMMAND_CHANGE_MODE':
      case 'COMMAND_ARM':
      case 'COMMAND_DISARM':
      case 'COMMAND_EMERGENCY_STOP': {
        if (!data || !data.droneId) {
          sendSafe(ws, createMessage('COMMAND_ERROR', {
            message: 'Missing droneId in command',
            command: type,
          }));
          break;
        }

        const droneId = data.droneId;
        const droneEntry = connectedDrones.get(droneId);

        if (!droneEntry) {
          sendSafe(ws, createMessage('COMMAND_ERROR', {
            droneId,
            command: type,
            message: `Drone ${droneId} is not connected`,
          }));
          break;
        }

        // Forward command to the specific drone
        console.log(`[GCS] 🔄 Routing command ${type} → ${droneId}`);
        sendSafe(droneEntry.ws, createMessage(type, {
          ...data,
          forwardedFrom: 'GCS',
          timestamp: new Date().toISOString(),
        }));

        // Acknowledge to dashboard
        sendSafe(ws, createMessage('COMMAND_SENT', {
          droneId,
          command: type,
          message: `Command ${type} forwarded to ${droneId}`,
          timestamp: new Date().toISOString(),
        }));

        break;
      }

      // ============================================
      // MISSION UPLOAD (Waypoints from Dashboard)
      // ============================================
      case 'UPLOAD_MISSION': {
        if (!data || !data.droneId || !data.waypoints) {
          sendSafe(ws, createMessage('UPLOAD_ERROR', {
            message: 'Missing droneId or waypoints',
          }));
          break;
        }

        const droneId = data.droneId;
        const droneEntry = connectedDrones.get(droneId);

        if (!droneEntry) {
          sendSafe(ws, createMessage('UPLOAD_ERROR', {
            droneId,
            message: `Drone ${droneId} is not connected`,
          }));
          break;
        }

        // Forward waypoints to drone
        console.log(`[GCS] 📋 Uploading ${data.waypoints.length} waypoints → ${droneId}`);
        sendSafe(droneEntry.ws, createMessage('UPLOAD_MISSION', {
          waypoints: data.waypoints,
          missionId: data.missionId || null,
          timestamp: new Date().toISOString(),
        }));

        sendSafe(ws, createMessage('UPLOAD_ACK', {
          droneId,
          waypointCount: data.waypoints.length,
          missionId: data.missionId || null,
          message: `Uploaded ${data.waypoints.length} waypoints to ${droneId}`,
        }));

        break;
      }

      // ============================================
      // DRONE EVENTS (Waypoint reached, mode change, etc.)
      // ============================================
      case 'WAYPOINT_REACHED':
      case 'MODE_CHANGED':
      case 'ARM_STATUS_CHANGED':
      case 'MISSION_COMPLETED':
      case 'MISSION_ABORTED': {
        if (data && data.droneId) {
          broadcastToDashboards(type, data);
        }
        break;
      }

      default:
        console.log(`[GCS] Unknown message type: ${type}`);
        break;
    }

  } catch (err) {
    console.error('[GCS] Error processing message:', err.message);
  }
}

// ===================================================================
// WEBSOCKET CLEANUP
// ===================================================================
function cleanupConnection(ws) {
  // Remove from drones
  connectedDrones.forEach((entry, droneId) => {
    if (entry.ws === ws) {
      connectedDrones.delete(droneId);
      console.log(`[GCS] 🛸 Drone disconnected: ${droneId}`);
      
      broadcastToDashboards('DRONE_DISCONNECTED', {
        droneId,
        message: `Drone ${droneId} disconnected`,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Remove from dashboards
  if (ws._dashboardId) {
    connectedDashboards.delete(ws._dashboardId);
    console.log(`[GCS] 🖥️ Dashboard disconnected: ${ws._dashboardId}`);
  }
}

// ===================================================================
// INIT WEBSOCKET SERVER
// ===================================================================
export function initWebSocketServer(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  console.log('✅ GCS WebSocket Engine initialized on path /ws');

  wss.on('connection', (ws, req) => {
    const clientAddr = req.socket.remoteAddress;
    console.log(`[GCS] New WebSocket connection from ${clientAddr}`);

    // Mark alive for heartbeat
    ws.isAlive = true;

    // Initial connection message
    sendSafe(ws, createMessage('GCS_CONNECTED', {
      message: 'Đã kết nối đến SAH-TECH Ground Control Station',
      version: '3.0.0',
      protocol: 'GCS-MissionPlanner',
    }));

    // Handle incoming messages
    ws.on('message', (raw) => {
      processMessage(ws, raw);
    });

    // Handle close
    ws.on('close', () => {
      cleanupConnection(ws);
    });

    // Handle errors
    ws.on('error', (err) => {
      console.error(`[GCS] WebSocket error from ${clientAddr}:`, err.message);
      cleanupConnection(ws);
    });

    // Handle pong response
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });

  // ============================================
  // HEARTBEAT: Ping/Pong every 30 seconds
  // Prevents timeout on Render (free tier)
  // ============================================
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        // No pong received since last ping → terminate
        console.log('[GCS] Heartbeat timeout, terminating connection');
        cleanupConnection(ws);
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  // ============================================
  // FAILSAFE MONITOR: Check drone lastSeen
  // Run every 10 seconds
  // ============================================
  const failsafeMonitor = setInterval(() => {
    const now = Date.now();
    const timeoutMs = 30000; // 30 seconds without telemetry = disconnected

    connectedDrones.forEach((entry, droneId) => {
      if (!entry.lastSeen) return;

      const elapsed = now - entry.lastSeen.getTime();
      
      // If drone hasn't sent telemetry for > 30s
      if (elapsed > timeoutMs) {
        console.log(`[FAILSAFE] ${droneId}: No telemetry for ${(elapsed/1000).toFixed(0)}s`);
        
        broadcastToDashboards('ALERT', {
          type: 'TELEMETRY_LOSS',
          droneId,
          severity: 'WARNING',
          message: `⚠️ Mất tín hiệu telemetry từ ${droneId} (${(elapsed/1000).toFixed(0)}s)`,
          elapsed_seconds: Math.floor(elapsed / 1000),
          timestamp: new Date().toISOString(),
        });

        // Mark as disconnected if > 60s
        if (elapsed > 60000) {
          entry.isRegistered = false;
          broadcastToDashboards('DRONE_DISCONNECTED', {
            droneId,
            reason: 'TELEMETRY_TIMEOUT',
            message: `Drone ${droneId} disconnected (telemetry timeout)`,
          });
        }
      }
    });
  }, 10000);

  // Cleanup on process exit
  process.on('SIGINT', () => {
    clearInterval(heartbeatInterval);
    clearInterval(failsafeMonitor);
  });
  process.on('SIGTERM', () => {
    clearInterval(heartbeatInterval);
    clearInterval(failsafeMonitor);
  });

  // Return wss for external use
  return wss;
}

// ===================================================================
// EXPOSE GCS STATE for REST API
// ===================================================================
export function getConnectedDrones() {
  const drones = [];
  connectedDrones.forEach((entry, droneId) => {
    drones.push({
      droneId,
      telemetry: entry.telemetry,
      connectedAt: entry.connectedAt,
      lastSeen: entry.lastSeen,
      isRegistered: entry.isRegistered,
    });
  });
  return drones;
}

export function getConnectedDashboardCount() {
  return connectedDashboards.size;
}

export function getDroneWs(droneId) {
  const entry = connectedDrones.get(droneId);
  return entry ? entry.ws : null;
}

export function getDroneTelemetry(droneId) {
  const entry = connectedDrones.get(droneId);
  return entry ? entry.telemetry : null;
}

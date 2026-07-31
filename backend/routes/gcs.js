/**
 * GCS REST API Routes - Ground Control Station
 * Exposes real-time WebSocket engine state and mission management
 */
import { Router } from 'express';
import { getConnectedDrones, getConnectedDashboardCount, getDroneWs, getDroneTelemetry } from '../websocket.js';

const router = Router();

/**
 * GET /api/gcs/status
 * GCS tổng quan: số drone đang kết nối, số dashboard, thông tin hệ thống
 */
router.get('/status', (req, res) => {
  try {
    const activeDrones = getConnectedDrones();
    const dashboardCount = getConnectedDashboardCount();

    res.json({
      success: true,
      data: {
        connectedDrones: activeDrones.length,
        connectedDashboards: dashboardCount,
        drones: activeDrones.map(d => ({
          droneId: d.droneId,
          lastSeen: d.lastSeen,
          connectedAt: d.connectedAt,
          isRegistered: d.isRegistered,
          telemetry: d.telemetry ? {
            lat: d.telemetry.lat || d.telemetry.gps_lat,
            lng: d.telemetry.lng || d.telemetry.gps_lng,
            alt: d.telemetry.alt || d.telemetry.altitude,
            battery: d.telemetry.battery,
            mode: d.telemetry.mode,
            speed: d.telemetry.speed || d.telemetry.ground_speed,
            heading: d.telemetry.heading,
          } : null,
        })),
      }
    });
  } catch (error) {
    console.error('GCS status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * GET /api/gcs/active-drones
 * Lấy danh sách drone thực tế đang duy trì kết nối WebSocket
 */
router.get('/active-drones', (req, res) => {
  try {
    const activeDrones = getConnectedDrones();
    res.json({ success: true, data: activeDrones });
  } catch (error) {
    console.error('Get active drones error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * POST /api/gcs/command
 * Gửi command tới drone qua WebSocket
 * Body: { droneId, command, params? }
 */
router.post('/command', (req, res) => {
  try {
    const { droneId, command, params } = req.body;
    if (!droneId || !command) {
      return res.status(400).json({ success: false, message: 'Thiếu droneId hoặc command' });
    }

    const validCommands = [
      'COMMAND_TAKEOFF', 'COMMAND_RTL', 'COMMAND_LAND', 
      'COMMAND_CHANGE_MODE', 'COMMAND_ARM', 'COMMAND_DISARM', 
      'COMMAND_EMERGENCY_STOP'
    ];
    if (!validCommands.includes(command)) {
      return res.status(400).json({
        success: false,
        message: `Command không hợp lệ. Valid: ${validCommands.join(', ')}`,
      });
    }

    const droneWs = getDroneWs(droneId);
    if (!droneWs) {
      return res.status(404).json({
        success: false,
        message: `Drone ${droneId} không kết nối`,
      });
    }

    const message = JSON.stringify({
      type: command,
      data: { droneId, ...params, forwardedFrom: 'GCS', timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString(),
    });

    try {
      droneWs.send(message);
    } catch (wsErr) {
      return res.status(502).json({ success: false, message: 'Lỗi gửi command đến drone' });
    }

    res.json({
      success: true,
      message: `Command ${command} sent to ${droneId}`,
      data: { droneId, command, timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Send command error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * GET /api/gcs/drone-telemetry/:droneId
 * Lấy telemetry mới nhất của drone từ in-memory cache
 */
router.get('/drone-telemetry/:droneId', (req, res) => {
  try {
    const telemetry = getDroneTelemetry(req.params.droneId);
    if (!telemetry) {
      return res.status(404).json({ success: false, message: 'Drone không kết nối hoặc không có telemetry' });
    }
    res.json({ success: true, data: telemetry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

export default router;

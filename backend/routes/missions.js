import { Router } from 'express';
import Mission from '../models/Mission.js';
import MissionLog from '../models/MissionLog.js';
import Order from '../models/Order.js';
import Drone from '../models/Drone.js';
import { getDroneWs } from '../websocket.js';

const router = Router();

/**
 * GET /api/missions
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const missions = await Mission.find(filter)
      .populate('order_id', 'code medical_item destination')
      .populate('drone_id', 'name status')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 20);

    res.json({ success: true, data: missions });
  } catch (error) {
    console.error('Get missions error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * GET /api/missions/active
 */
router.get('/active', async (req, res) => {
  try {
    const activeMission = await Mission.findOne({
      status: { $nin: ['completed', 'cancelled'] }
    })
      .populate('order_id', 'code medical_item destination urgency')
      .populate('drone_id', 'name status')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: activeMission || null });
  } catch (error) {
    console.error('Get active mission error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * POST /api/missions
 */
router.post('/', async (req, res) => {
  try {
    const { order_id, drone_id, destination, destination_lat, destination_lng } = req.body;
    if (!order_id || !drone_id || !destination) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin mission' });
    }

    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });

    const drone = await Drone.findById(drone_id);
    if (!drone) return res.status(404).json({ success: false, message: 'Không tìm thấy drone' });

    // Check existing active mission for this drone
    const existingActive = await Mission.findOne({
      drone_id,
      status: { $nin: ['completed', 'cancelled'] }
    });
    if (existingActive) {
      return res.status(409).json({ success: false, message: 'Drone này đang có mission active' });
    }

    const mission = await Mission.create({
      order_id,
      drone_id,
      destination,
      destination_lat: destination_lat || null,
      destination_lng: destination_lng || null,
      status: 'pending',
    });

    // Update order status
    await Order.findByIdAndUpdate(order_id, {
      status: 'packaging',
      assigned_drone_id: drone_id,
    });

    const populated = await Mission.findById(mission._id)
      .populate('order_id', 'code medical_item destination')
      .populate('drone_id', 'name status');

    res.status(201).json({ success: true, message: 'Mission đã được tạo', data: populated });
  } catch (error) {
    console.error('Create mission error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * PUT /api/missions/:id/status
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preflight', 'takeoff', 'en_route', 'delivering', 'returning', 'landing', 'docking', 'completed', 'emergency_rtl', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const update = { status };
    if (status === 'takeoff') update.started_at = new Date();
    if (['completed', 'cancelled'].includes(status)) update.completed_at = new Date();

    const mission = await Mission.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!mission) return res.status(404).json({ success: false, message: 'Không tìm thấy mission' });

    // Map mission status to order status
    const orderStatusMap = {
      'pending': 'pending', 'preflight': 'packaging', 'takeoff': 'departed',
      'en_route': 'inflight', 'delivering': 'inflight', 'returning': 'inflight',
      'landing': 'inflight', 'docking': 'inflight', 'completed': 'delivered',
      'emergency_rtl': 'cancelled', 'cancelled': 'cancelled',
    };

    if (orderStatusMap[status]) {
      await Order.findByIdAndUpdate(mission.order_id, { status: orderStatusMap[status] });
    }

    const populated = await Mission.findById(mission._id)
      .populate('order_id', 'code medical_item destination')
      .populate('drone_id', 'name status');

    res.json({ success: true, message: `Mission status updated to ${status}`, data: populated });
  } catch (error) {
    console.error('Update mission status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * POST /api/missions/:id/logs
 */
router.post('/:id/logs', async (req, res) => {
  try {
    const { log_type, tag, message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Thiếu nội dung log' });

    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ success: false, message: 'Không tìm thấy mission' });

    const log = await MissionLog.create({
      mission_id: req.params.id,
      log_type: log_type || 'info',
      tag: tag || 'SYSTEM',
      message,
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    console.error('Create mission log error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * GET /api/missions/:id/logs
 */
router.get('/:id/logs', async (req, res) => {
  try {
    const { type, limit = 100 } = req.query;
    const filter = { mission_id: req.params.id };
    if (type) filter.log_type = type;

    const logs = await MissionLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 100);

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Get mission logs error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * POST /api/missions/:id/upload
 * Lưu danh sách Waypoints vào DB và phát UPLOAD_MISSION tới Drone qua WebSocket
 * Body: { waypoints: [{ seq, lat, lng, alt, action, speed }] }
 */
router.post('/:id/upload', async (req, res) => {
  try {
    const { waypoints } = req.body;
    if (!waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách waypoints không hợp lệ' });
    }

    for (const wp of waypoints) {
      if (wp.lat === undefined || wp.lng === undefined || wp.seq === undefined) {
        return res.status(400).json({ success: false, message: `Waypoint ${wp.seq || '?'} thiếu lat/lng/seq` });
      }
    }

    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy mission' });
    }

    // Save waypoints to DB
    mission.waypoints = waypoints.map(wp => ({
      seq: wp.seq,
      lat: wp.lat,
      lng: wp.lng,
      alt: wp.alt || 50,
      action: wp.action || 'WAYPOINT',
      speed: wp.speed || 10,
      accept_radius: wp.accept_radius || 5,
      loiter_seconds: wp.loiter_seconds || 0,
      description: wp.description || '',
      altitude_type: wp.altitude_type || 'RELATIVE',
    }));
    mission.current_waypoint = 0;
    await mission.save();

    // Forward to drone via WebSocket if connected
    const droneWs = getDroneWs(mission.drone_id?.toString());
    if (droneWs) {
      droneWs.send(JSON.stringify({
        type: 'UPLOAD_MISSION',
        data: {
          droneId: mission.drone_id.toString(),
          waypoints: mission.waypoints,
          missionId: mission._id.toString(),
        },
        timestamp: new Date().toISOString(),
      }));
    }

    // Log event
    await MissionLog.create({
      mission_id: mission._id,
      drone_id: mission.drone_id,
      log_type: 'MISSION_UPLOADED',
      tag: 'GCS',
      message: `Đã upload ${waypoints.length} waypoints lên mission ${mission.name}`,
      snapshot: {
        lat: waypoints[0]?.lat,
        lng: waypoints[0]?.lng,
        alt: waypoints[0]?.alt,
        mode: 'AUTO',
      },
    });

    const populated = await Mission.findById(mission._id)
      .populate('drone_id', 'name status')
      .populate('order_id', 'code medical_item destination');

    res.json({
      success: true,
      message: `Đã upload ${waypoints.length} waypoints`,
      data: populated,
    });
  } catch (error) {
    console.error('Upload waypoints error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

export default router;

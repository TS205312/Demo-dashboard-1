import { Router } from 'express';
import Drone from '../models/Drone.js';
import Mission from '../models/Mission.js';

const router = Router();

/**
 * GET /api/drones
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const drones = await Drone.find(filter).sort({ name: 1 });
    res.json({ success: true, data: drones });
  } catch (error) {
    console.error('Get drones error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * GET /api/drones/:id
 * Supports both MongoDB ObjectId and legacy numeric id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let drone;

    // Try ObjectId first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      drone = await Drone.findById(id);
    }
    // Fallback to name-based lookup (Drone Alpha, etc.)
    if (!drone) {
      drone = await Drone.findOne({ name: { $regex: new RegExp(id, 'i') } });
    }
    if (!drone) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy drone' });
    }

    const activeMission = await Mission.findOne({
      drone_id: drone._id,
      status: { $nin: ['completed', 'cancelled'] }
    }).sort({ createdAt: -1 }).populate('order_id', 'code medical_item destination');

    res.json({ success: true, data: { ...drone.toObject(), active_mission: activeMission || null } });
  } catch (error) {
    console.error('Get drone error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * PUT /api/drones/:id/telemetry
 */
router.put('/:id/telemetry', async (req, res) => {
  try {
    const { battery, temperature, altitude, speed, heading, pitch, roll, gps_lat, gps_lng, status, armed, mode } = req.body;

    const update = {};
    if (battery !== undefined) update.battery = battery;
    if (temperature !== undefined) update.temperature = temperature;
    if (altitude !== undefined) update.altitude = altitude;
    if (speed !== undefined) update.speed = speed;
    if (heading !== undefined) update.heading = heading;
    if (pitch !== undefined) update.pitch = pitch;
    if (roll !== undefined) update.roll = roll;
    if (gps_lat !== undefined) update.gps_lat = gps_lat;
    if (gps_lng !== undefined) update.gps_lng = gps_lng;
    if (status !== undefined) update.status = status;
    if (armed !== undefined) update.armed = armed;
    if (mode !== undefined) update.mode = mode;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, message: 'Không có dữ liệu để cập nhật' });
    }

    const drone = await Drone.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!drone) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy drone' });
    }

    res.json({ success: true, data: drone });
  } catch (error) {
    console.error('Update drone telemetry error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

export default router;

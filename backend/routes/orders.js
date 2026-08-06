import { Router } from 'express';
import Order from '../models/Order.js';
import Drone from '../models/Drone.js';
import { broadcastOrderEvent } from '../websocket.js';

const router = Router();

/**
 * GET /api/orders
 */
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('assigned_drone_id', 'name status')
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 50);

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * GET /api/orders/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('assigned_drone_id', 'name status')
      .populate('created_by', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const Mission = (await import('../models/Mission.js')).default;
    const mission = await Mission.findOne({ order_id: order._id }).sort({ createdAt: -1 });

    res.json({ success: true, data: { ...order.toObject(), mission: mission || null } });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * POST /api/orders
 * Tạo đơn hàng mới (từ User UI) và broadcast real-time tới mọi client
 */
router.post('/', async (req, res) => {
  try {
    const { medical_item, destination, urgency, notes, created_by } = req.body;
    if (!medical_item || !destination || !urgency) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    // Generate code
    const count = await Order.countDocuments();
    const code = `SAH-${String(count + 1).padStart(4, '0')}`;

    const order = await Order.create({
      code,
      medical_item,
      destination,
      urgency,
      notes: notes || '',
      status: 'pending',
      created_by: created_by || null,
    });

    // Broadcast new order to all connected clients (User UI + Dashboard)
    try {
      broadcastOrderEvent('new_order', order);
    } catch (wsErr) {
      console.warn('Broadcast new_order failed:', wsErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Đơn hàng đã được tạo thành công!',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * PUT /api/orders/:id/status
 * Cập nhật trạng thái đơn hàng (từ Command Center) và broadcast real-time
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { status, assigned_drone_id } = req.body;
    const validStatuses = ['pending', 'packaging', 'departed', 'inflight', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const update = { status };
    if (assigned_drone_id) update.assigned_drone_id = assigned_drone_id;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Broadcast status update to all connected clients for real-time timeline
    try {
      broadcastOrderEvent('order_status_update', order);
    } catch (wsErr) {
      console.warn('Broadcast order_status_update failed:', wsErr.message);
    }

    res.json({ success: true, message: `Đã cập nhật trạng thái thành ${status}`, data: order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * DELETE /api/orders/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    res.json({ success: true, message: 'Đã xóa đơn hàng' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

export default router;

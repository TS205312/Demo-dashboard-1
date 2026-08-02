import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

// Mã OTP công ty - chỉ nhân viên/bác sĩ trong công ty mới biết
// Có thể đổi qua biến môi trường COMPANY_OTP
const COMPANY_OTP = process.env.COMPANY_OTP || 'SAH2025';

/**
 * POST /api/auth/login
 * Đăng nhập chung cho cả Dashboard (staff/admin) và User UI (bác sĩ)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctor_id: user.doctor_id || '',
        department: user.department || '',
        hospital: user.hospital || '',
        phone: user.phone || '',
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * POST /api/auth/register
 * Đăng ký - bắt buộc nhập Mã OTP công ty (chỉ người trong công ty mới truy cập)
 */
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password,
      company_otp,        // Mã OTP công ty
      role = 'user',      // 'user' = bác sĩ (User UI), 'staff' = nhân viên (Dashboard)
      doctor_id, department, hospital, phone,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Kiểm tra mã OTP công ty
    if (!company_otp || company_otp !== COMPANY_OTP) {
      return res.status(403).json({
        success: false,
        message: 'Mã OTP công ty không hợp lệ. Vui lòng liên hệ quản trị viên để được cấp mã.',
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email này đã được đăng ký' });
    }

    // role hợp lệ: bác sĩ (user) hoặc nhân viên vận hành (staff)
    const allowedRole = role === 'staff' ? 'staff' : 'user';

    const user = await User.create({
      name,
      email,
      password,
      role: allowedRole,
      doctor_id: doctor_id || '',
      department: department || '',
      hospital: hospital || '',
      phone: phone || '',
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctor_id: user.doctor_id || '',
        department: user.department || '',
        hospital: user.hospital || '',
        phone: user.phone || '',
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

/**
 * GET /api/auth/users
 * Lấy danh sách users (admin only)
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

export default router;


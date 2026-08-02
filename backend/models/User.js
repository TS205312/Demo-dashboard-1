import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'user'], default: 'user' },
  // Thông tin bác sĩ (User UI)
  doctor_id: { type: String, default: '' },   // Mã bác sĩ (VD: BS001)
  department: { type: String, default: '' },  // Khoa phòng (VD: Khoa Cấp cứu)
  hospital: { type: String, default: '' },    // Bệnh viện công tác
  phone: { type: String, default: '' },       // Số điện thoại liên hệ
  createdAt: { type: Date, default: Date.now },
});

// Serialize: luôn kèm field `id` để tương thích frontend
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.password;
    return ret;
  }
});

export default mongoose.model('User', userSchema);


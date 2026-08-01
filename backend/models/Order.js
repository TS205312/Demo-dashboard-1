import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  medical_item: { type: String, required: true },
  destination: { type: String, required: true },
  urgency: { type: String, required: true },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'packaging', 'departed', 'inflight', 'delivered', 'cancelled'],
    default: 'pending'
  },
  assigned_drone_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Drone', default: null },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  _progress: { type: Number, default: 0 },
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate code: SAH-XXXX
    const seq = mongoose.model('Order').countDocuments().then(count => {
      this.code = `SAH-${String(count + 1).padStart(4, '0')}`;
      next();
    }).catch(next);
  } else {
    next();
  }
});

export default mongoose.model('Order', orderSchema);

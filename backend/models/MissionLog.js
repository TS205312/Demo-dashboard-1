import mongoose from 'mongoose';

/**
 * Mission Log Schema - GCS Black Box
 * Lưu vết lịch sử sự kiện Mission Planner style
 */
const missionLogSchema = new mongoose.Schema({
  mission_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission', required: true },
  drone_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Drone', default: null },
  
  // === Log Classification ===
  log_type: { 
    type: String, 
    enum: [
      'sys', 'mav', 'cmd', 'info', 'error', 'warning',
      // GCS-specific event types
      'RTL_TRIGGERED', 'LOW_BATTERY', 'WAYPOINT_REACHED', 
      'DISCONNECTED', 'CONNECTED', 'TELEMETRY_LOSS', 
      'MISSION_UPLOADED', 'MISSION_STARTED', 'MISSION_PAUSED',
      'MISSION_ABORTED', 'MISSION_COMPLETED', 'ARM_CHANGE',
      'MODE_CHANGE', 'GPS_FIX_CHANGE', 'FAILSAFE_ACTION'
    ],
    default: 'info'
  },
  
  tag: { type: String, default: 'SYSTEM' },
  message: { type: String, required: true },
  
  // === Telemetry Snapshot at event time ===
  snapshot: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    alt: { type: Number, default: null },
    battery: { type: Number, default: null },
    mode: { type: String, default: null },
    speed: { type: Number, default: null },
  },

}, { timestamps: true });

// Indexes
missionLogSchema.index({ mission_id: 1, createdAt: -1 });
missionLogSchema.index({ log_type: 1 });
missionLogSchema.index({ createdAt: -1 });

// Serialize: luôn kèm field `id` để tương thích frontend
missionLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

export default mongoose.model('MissionLog', missionLogSchema);

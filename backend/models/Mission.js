import mongoose from 'mongoose';

/**
 * Waypoint sub-schema for mission planning
 */
const waypointSchema = new mongoose.Schema({
  seq: { type: Number, required: true },          // Waypoint sequence number
  lat: { type: Number, required: true },           // Latitude
  lng: { type: Number, required: true },           // Longitude
  alt: { type: Number, default: 50 },              // Altitude in meters
  action: { 
    type: String, 
    enum: ['WAYPOINT', 'TAKEOFF', 'LAND', 'RTL', 'LOITER_TIME', 'LOITER_TURNS', 'LOITER_UNLIM', 'CHANGE_SPEED', 'SET_HOME', 'JUMP', 'DELAY', 'SET_SERVO', 'DO_GRIPPER'],
    default: 'WAYPOINT'
  },
  speed: { type: Number, default: 10 },            // Target speed at waypoint (m/s)
  accept_radius: { type: Number, default: 5 },     // Acceptance radius in meters
  loiter_seconds: { type: Number, default: 0 },   // For LOITER_TIME action
  description: { type: String, default: '' },      // Optional label
  altitude_type: { 
    type: String, 
    enum: ['RELATIVE', 'ABSOLUTE', 'TERRAIN'],
    default: 'RELATIVE'
  },
});

/**
 * Mission Schema - GCS Mission Planner
 * Lưu trữ nhiệm vụ bay với danh sách waypoints chi tiết
 */
const missionSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  drone_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Drone', required: true },
  
  // Mission metadata
  name: { type: String, default: '' },              // Mission name
  description: { type: String, default: '' },
  destination: { type: String, default: '' },        // Human-readable destination
  destination_lat: { type: Number, default: null },
  destination_lng: { type: Number, default: null },

  // === Waypoints ===
  waypoints: { type: [waypointSchema], default: [] },
  current_waypoint: { type: Number, default: 0 },   // Current waypoint index being executed

  // === Flight State Machine ===
  status: {
    type: String,
    enum: [
      'pending', 'preflight', 'taking_off', 'en_route', 
      'waypoint_nav', 'loitering', 'delivering', 'returning', 
      'landing', 'docked', 'completed', 'emergency_rtl', 'cancelled', 'failed'
    ],
    default: 'pending'
  },

  // === Failsafe ===
  failsafe_reason: { type: String, default: '' },   // Why emergency was triggered
  rtl_altitude: { type: Number, default: 50 },      // RTL cruise altitude
  low_battery_threshold: { type: Number, default: 15 }, // %

  // === Timestamps ===
  started_at: { type: Date, default: null },
  completed_at: { type: Date, default: null },
  
}, { timestamps: true });

// Indexes
missionSchema.index({ drone_id: 1, status: 1 });
missionSchema.index({ status: 1 });
missionSchema.index({ order_id: 1 });

// Pre-save: Auto-generate mission name if empty
missionSchema.pre('save', function(next) {
  if (!this.name) {
    this.name = `Mission-${this._id.toString().slice(-6).toUpperCase()}`;
  }
  next();
});

export default mongoose.model('Mission', missionSchema);

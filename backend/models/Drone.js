import mongoose from 'mongoose';

/**
 * Drone Schema - GCS Mission Planner Edition
 * Lưu trữ thông tin UAV và telemetry thời gian thực
 */
const droneSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['online', 'offline', 'warning', 'emergency'], 
    default: 'offline' 
  },
  
  // === UAV Flight Modes (ArduPilot/PX4 compatible) ===
  mode: { 
    type: String, 
    enum: ['STABILIZE', 'GUIDED', 'AUTO', 'RTL', 'LAND', 'LOITER', 'MANUAL', 'ACRO', 'HOLD'],
    default: 'STABILIZE'
  },
  armed: { type: Boolean, default: false },
  isConnected: { type: Boolean, default: false },
  lastSeen: { type: Date, default: null },

  // === Telemetry: Position ===
  gps_lat: { type: Number, default: 10.759 },
  gps_lng: { type: Number, default: 106.664 },
  altitude: { type: Number, default: 0 },         // Relative alt (m)
  altitude_abs: { type: Number, default: 0 },      // Absolute alt AMSL (m)
  ground_speed: { type: Number, default: 0 },      // Ground speed (m/s)
  air_speed: { type: Number, default: 0 },         // Air speed (m/s)
  heading: { type: Number, default: 0 },           // Compass heading 0-360°
  climb_rate: { type: Number, default: 0 },        // Vertical speed (m/s)

  // === Telemetry: Attitude ===
  pitch: { type: Number, default: 0 },
  roll: { type: Number, default: 0 },
  yaw: { type: Number, default: 0 },

  // === Telemetry: Power ===
  battery: { type: Number, default: 100 },         // Percentage 0-100
  battery_voltage: { type: Number, default: 25.2 }, // Volts (6S LiPo = 25.2V full)
  battery_current: { type: Number, default: 0 },   // Amps
  battery_remaining_mah: { type: Number, default: 5000 },

  // === Telemetry: Environment ===
  temperature: { type: Number, default: 25 },
  wind_speed: { type: Number, default: 0 },         // m/s
  wind_direction: { type: Number, default: 0 },
  gps_fix_type: { 
    type: Number, 
    enum: [0, 2, 3, 4, 5, 6], 
    default: 3,
    description: '0=NoGPS, 2=2D, 3=3D, 4=DGPS, 5=RTK Float, 6=RTK Fixed'
  },
  satellites_visible: { type: Number, default: 12 },

  // === Hardware ===
  flight_hours: { type: Number, default: 0 },
  flight_cycles: { type: Number, default: 0 },
  last_maintenance: { type: String, default: '' },
  firmware_version: { type: String, default: 'ArduCopter 4.5.0' },
  frame_type: { type: String, default: 'vtol' },

  // === Stats ===
  distance_traveled: { type: Number, default: 0 },  // Total km
  max_altitude_reached: { type: Number, default: 0 },
  home_position: {
    lat: { type: Number, default: 10.759 },
    lng: { type: Number, default: 106.664 },
  },

}, { timestamps: true });

// Index for fast queries
droneSchema.index({ isConnected: 1 });
droneSchema.index({ status: 1 });
droneSchema.index({ battery: 1 });

export default mongoose.model('Drone', droneSchema);

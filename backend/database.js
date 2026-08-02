import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sah_tech';

let isConnected = false;
let mongod = null;

/**
 * Try to connect to a local MongoDB, fallback to mongodb-memory-server
 */
export async function connectDatabase() {
  if (isConnected) return;

  // First try: connect to local MongoDB
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log('✅ MongoDB connected (local)');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    return;
  } catch (err) {
    console.log('⚠️ Local MongoDB not available, starting in-memory MongoDB...');
  }

  // Second try: use mongodb-memory-server
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('✅ MongoDB connected (in-memory)');
    console.log(`   URI: ${uri}`);
  } catch (error) {
    console.error('❌ Failed to start in-memory MongoDB:', error.message);
    throw error;
  }
}

/**
 * Ngắt kết nối
 */
export async function closeDatabase() {
  if (!isConnected) return;
  try {
    await mongoose.disconnect();
    isConnected = false;
    if (mongod) {
      await mongod.stop();
      mongod = null;
    }
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnect error:', error.message);
  }
}

/**
 * Seed dữ liệu mẫu
 */
export async function seedDatabase() {
  const User = mongoose.model('User');
  const Drone = mongoose.model('Drone');

  // Seed admin account
  const adminExists = await User.findOne({ email: 'admin@sah.tech' });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: 'admin@sah.tech',
      password: 'admin123',
      role: 'admin',
    });
    console.log('   ✅ Admin account created: admin@sah.tech / admin123');
  }

  // Seed demo doctor account (User UI)
  const doctorExists = await User.findOne({ email: 'bs.an@sah.tech' });
  if (!doctorExists) {
    await User.create({
      name: 'BS. Nguyễn Văn An',
      email: 'bs.an@sah.tech',
      password: 'doctor123',
      role: 'user',
      doctor_id: 'BS001',
      department: 'Khoa Cấp cứu',
      hospital: 'Bệnh viện Chợ Rẫy',
      phone: '0901234567',
    });
    console.log('   ✅ Demo doctor created: bs.an@sah.tech / doctor123 (Khoa Cấp cứu)');
  }

  // Seed demo staff account (Dashboard - OTP SAH2025)
  const staffExists = await User.findOne({ email: 'staff@sah.tech' });
  if (!staffExists) {
    await User.create({
      name: 'Nhân viên điều phối',
      email: 'staff@sah.tech',
      password: 'staff123',
      role: 'staff',
      department: 'Trung tâm điều phối',
    });
    console.log('   ✅ Demo staff created: staff@sah.tech / staff123');
  }

  // Seed drones (GCS Mission Planner schema)
  const droneCount = await Drone.countDocuments();
  if (droneCount === 0) {
    const seedDrones = [
      {
        name: 'Drone Alpha', status: 'online', mode: 'AUTO', armed: true, isConnected: true,
        gps_lat: 10.8231, gps_lng: 106.6297, altitude: 120, ground_speed: 18.5, heading: 45,
        pitch: -5, roll: 3, battery: 78, battery_voltage: 24.8, temperature: 32.5,
        satellites_visible: 14, gps_fix_type: 3, flight_hours: 245, last_maintenance: '2025-03-15',
      },
      {
        name: 'Drone Beta', status: 'online', mode: 'AUTO', armed: true, isConnected: true,
        gps_lat: 10.7769, gps_lng: 106.6952, altitude: 85, ground_speed: 22.3, heading: 270,
        pitch: 2, roll: -1, battery: 45, battery_voltage: 22.1, temperature: 28.1,
        satellites_visible: 12, gps_fix_type: 3, flight_hours: 412, last_maintenance: '2025-04-01',
      },
      {
        name: 'Drone Gamma', status: 'warning', mode: 'RTL', armed: false, isConnected: true,
        gps_lat: 10.8500, gps_lng: 106.6500, altitude: 200, ground_speed: 0, heading: 180,
        pitch: -10, roll: 8, battery: 15, battery_voltage: 18.5, temperature: 41.2,
        satellites_visible: 8, gps_fix_type: 3, flight_hours: 567, last_maintenance: '2025-02-20',
      },
      {
        name: 'Drone Delta', status: 'offline', mode: 'STABILIZE', armed: false, isConnected: false,
        gps_lat: 10.8000, gps_lng: 106.6000, altitude: 0, ground_speed: 0, heading: 0,
        pitch: 0, roll: 0, battery: 92, battery_voltage: 25.0, temperature: 25.0,
        satellites_visible: 0, gps_fix_type: 0, flight_hours: 189, last_maintenance: '2025-03-28',
      },
      {
        name: 'Drone Epsilon', status: 'online', mode: 'GUIDED', armed: true, isConnected: true,
        gps_lat: 10.8700, gps_lng: 106.7100, altitude: 150, ground_speed: 25.0, heading: 90,
        pitch: -3, roll: 5, battery: 60, battery_voltage: 23.5, temperature: 30.8,
        satellites_visible: 16, gps_fix_type: 4, flight_hours: 321, last_maintenance: '2025-04-10',
      },
      {
        name: 'Drone Zeta', status: 'online', mode: 'AUTO', armed: false, isConnected: true,
        gps_lat: 10.7500, gps_lng: 106.6800, altitude: 95, ground_speed: 15.7, heading: 135,
        pitch: 4, roll: -2, battery: 33, battery_voltage: 21.0, temperature: 35.6,
        satellites_visible: 11, gps_fix_type: 3, flight_hours: 298, last_maintenance: '2025-03-05',
      },
    ];
    await Drone.insertMany(seedDrones);
    console.log(`   ✅ ${seedDrones.length} drones seeded (GCS schema)`);
  }
}

// Cleanup script: remove mojibake/corrupt records from MongoDB
// Detects records containing '?' where Vietnamese accent chars should be
import mongoose from 'mongoose';
import { connectDatabase, closeDatabase } from './database.js';
import './models/Order.js'; // register Order model
import './models/User.js'; // register User model

async function cleanup() {
  await connectDatabase();

  const Order = mongoose.model('Order');
  const User = mongoose.model('User');

  // Find orders with mojibake (contains '?' in fields that should have Vietnamese)
  const allOrders = await Order.find();
  let deleted = 0;
  for (const o of allOrders) {
    const text = JSON.stringify({ m: o.medical_item, d: o.destination, u: o.urgency });
    // Corrupt pattern: contains '?' but original Vietnamese should not have '?' 
    // Legacy mojibake uses '?' as replacement char
    if (text.includes('?') && /m||||nh vi|i m|p c/.test(text)) {
      await Order.findByIdAndDelete(o._id);
      deleted++;
      console.log(`🗑️  Deleted corrupt order: ${o.code} (${o.medical_item} / ${o.destination})`);
    }
  }

  // Also try to repair simple mojibake if any (best-effort)
  console.log(`\n✅ Cleanup done. Deleted ${deleted} corrupt orders.`);

  await closeDatabase();
  process.exit(0);
}

cleanup().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});

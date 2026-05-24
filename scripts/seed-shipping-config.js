/**
 * One-time script to create /config/shipping in Firestore.
 * Run from the project root:
 *
 *   set SA_KEY=D:\path\to\firebase-adminsdk.json   (Windows CMD)
 *   node scripts\seed-shipping-config.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const saKeyPath = process.env.SA_KEY;
if (!saKeyPath) {
  console.error('Error: set SA_KEY env var to the path of your Firebase service account JSON');
  console.error('Example (Windows): set SA_KEY=D:\\path\\to\\key.json');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(resolve(saKeyPath), 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'project-0a287015-616b-4f71-bbf',
});

const db = admin.firestore();

const CONFIG = {
  base_fee_sar: 7,
  free_distance_km: 10,
  per_km_rate_sar: 1,
  warehouse: {
    lat: 20.4922,
    lng: 44.8086,
    label: 'Wadi Aldawaseer Warehouse',
  },
  service_radius_km: 30,
  urgency_multipliers: {
    urgent_now: 2.0,
    same_day_within_5h: 1.5,
    same_day_after_5h: 1.2,
    next_day_or_later: 1.0,
  },
  operating_hours: {
    start: '08:00',
    end: '22:00',
    timezone: 'Asia/Riyadh',
  },
  urgent_now_enabled: true,
};

async function main() {
  const ref = db.collection('config').doc('shipping');
  const snap = await ref.get();

  if (snap.exists) {
    console.log('⚠️  /config/shipping already exists. Current value:');
    console.log(JSON.stringify(snap.data(), null, 2));
    console.log('\nTo overwrite, delete the doc in Firebase Console first, then re-run.');
    process.exit(0);
  }

  await ref.set(CONFIG);
  console.log('✅  /config/shipping created successfully:');
  console.log(JSON.stringify(CONFIG, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});

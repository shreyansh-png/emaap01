/**
 * Synthetic dataset seeder — Legal Metrology MVP
 * Run: node scripts/seed.js            (adds data)
 *      node scripts/seed.js --reset    (wipes collections first, then seeds)
 *
 * Populates: User (user/lmo/admin), Instrument, Application, Certificate
 * with realistic relationships and every status in the app flow, so the
 * dashboard, tables, and filters all have something to show.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');
const Instrument = require('../models/Instrument');
const Application = require('../models/Application');
const Certificate = require('../models/Certificate');
const generateQR = require('../utils/generateQR');

const RESET = process.argv.includes('--reset');

// ---------- helpers ----------
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);
const fakeSupabaseId = () => uuidv4();

const STATES = {
  Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur'],
  Maharashtra: ['Pune', 'Mumbai', 'Nagpur'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Varanasi'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara'],
};

const INSTRUMENT_TYPES = [
  'Weighing Scale', 'Platform Scale', 'Counter Scale', 'Spring Balance',
  'Electronic Weighing Machine', 'Fuel Dispensing Pump', 'Water Meter',
  'Electricity Meter', 'Measuring Tape', 'Capacity Measure',
];

const MANUFACTURERS = ['Avery India Ltd', 'Essae Digitronics', 'Contech Instruments', 'HDPE Metering Co', 'Precision Scales Pvt Ltd'];

const OWNER_NAMES = [
  ['Rajesh Kumar', 'Kumar Traders'],
  ['Sunita Sharma', 'Sharma General Store'],
  ['Anil Mehta', 'Mehta Fuel Station'],
  ['Priya Patel', 'Patel Dairy Farm'],
  ['Vikram Singh', 'Singh Wholesale Mart'],
  ['Fatima Sheikh', 'Sheikh Electricals'],
];

const LMO_NAMES = [
  ['Deepak Verma', 'State Legal Metrology Dept'],
  ['Kavita Joshi', 'State Legal Metrology Dept'],
  ['Suresh Nair', 'District GATC Office'],
  ['Meena Rathore', 'District GATC Office'],
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  if (RESET) {
    await Promise.all([User.deleteMany({}), Instrument.deleteMany({}), Application.deleteMany({}), Certificate.deleteMany({})]);
    console.log('Existing collections cleared');
  }

  // ---------- 1. USERS ----------
  const admin = await User.create({
    supabaseId: fakeSupabaseId(),
    email: 'admin@legalmetrology.gov.in',
    role: 'admin',
    name: 'Anjali Desai',
    organization: 'Dept of Consumer Affairs',
    state: 'Rajasthan',
    district: 'Jaipur',
    phone: '9000000001',
    address: 'Directorate Office, Jaipur',
  });

  const lmos = [];
  for (const [name, org] of LMO_NAMES) {
    const [state, districts] = pick(Object.entries(STATES));
    lmos.push(
      await User.create({
        supabaseId: fakeSupabaseId(),
        email: `${name.split(' ')[0].toLowerCase()}.lmo@legalmetrology.gov.in`,
        role: 'lmo',
        name,
        organization: org,
        state,
        district: pick(districts),
        phone: `90000${Math.floor(10000 + Math.random() * 89999)}`,
        address: `${org}, ${state}`,
      })
    );
  }

  const users = [];
  for (const [name, org] of OWNER_NAMES) {
    const [state, districts] = pick(Object.entries(STATES));
    const district = pick(districts);
    users.push(
      await User.create({
        supabaseId: fakeSupabaseId(),
        email: `${name.split(' ')[0].toLowerCase()}@example.com`,
        role: 'user',
        name,
        organization: org,
        state,
        district,
        phone: `98${Math.floor(10000000 + Math.random() * 89999999)}`,
        address: `${Math.floor(1 + Math.random() * 200)}, Market Road, ${district}`,
      })
    );
  }

  console.log(`Users created: 1 admin, ${lmos.length} lmo, ${users.length} user`);

  // ---------- 2. INSTRUMENTS ----------
  const instruments = [];
  let serial = 1000;
  for (const owner of users) {
    const count = 2 + Math.floor(Math.random() * 3); // 2-4 per user
    for (let i = 0; i < count; i++) {
      const type = pick(INSTRUMENT_TYPES);
      instruments.push(
        await Instrument.create({
          ownerId: owner._id,
          type,
          model: `MDL-${Math.floor(100 + Math.random() * 900)}`,
          serialNumber: `SER-${serial++}`,
          manufacturer: pick(MANUFACTURERS),
          capacity: type.includes('Weighing') || type.includes('Scale') ? `${pick([50, 100, 500, 1000])} kg` : undefined,
          accuracy: pick(['Class II', 'Class III']),
          location: owner.organization,
          state: owner.state,
          district: owner.district,
          status: 'unverified', // updated below once applications are resolved
        })
      );
    }
  }
  console.log(`Instruments created: ${instruments.length}`);

  // ---------- 3. APPLICATIONS + CERTIFICATES ----------
  // Distribute instruments across every stage of the flow.
  const statusPlan = [
    'submitted', 'submitted',
    'assigned', 'assigned',
    'scheduled', 'scheduled',
    'in_progress',
    'completed', 'completed', 'completed', // pass -> certificate
    'completed', // fail
    'rejected',
  ];

  let applicationsCreated = 0;
  let certificatesCreated = 0;

  for (let i = 0; i < instruments.length; i++) {
    const instrument = instruments[i];
    const status = statusPlan[i % statusPlan.length];
    const lmo = pick(lmos);

    const base = {
      instrumentId: instrument._id,
      ownerId: instrument.ownerId,
      type: pick(['initial', 're-verification']),
      verificationLocation: pick(['on-site', 'lab']),
      status,
    };

    if (['assigned', 'scheduled', 'in_progress', 'completed'].includes(status)) {
      base.assignedLmoId = lmo._id;
    }
    if (['scheduled', 'in_progress', 'completed'].includes(status)) {
      base.scheduledDate = daysFromNow(Math.floor(Math.random() * 10) - 5);
      base.scheduledTime = pick(['10:00 AM', '11:30 AM', '2:00 PM', '4:00 PM']);
    }

    let result = null;
    if (status === 'completed') {
      // last "completed" slot in the plan is the fail case
      result = i % statusPlan.length === statusPlan.lastIndexOf('completed') ? 'fail' : 'pass';
      base.result = result;
      base.verificationDate = daysFromNow(-Math.floor(Math.random() * 30));
      base.observations = {
        readings: 'Standard weight: 10kg, Measured: 10.02kg',
        errorFound: '0.02kg',
        toleranceWithin: result === 'pass',
        remarks: result === 'pass' ? 'Instrument within permissible limits' : 'Error exceeds permissible limit',
      };
    }
    if (status === 'rejected') {
      base.rejectionReason = 'Documents incomplete';
    }

    const application = await Application.create(base);
    applicationsCreated++;

    // Sync instrument status with the application outcome (mirrors verify-route side effects)
    if (status === 'completed' && result === 'pass') {
      instrument.status = 'verified';
      instrument.lastVerificationDate = base.verificationDate;
      instrument.validityEndDate = daysFromNow(365 - Math.floor(Math.random() * 380)); // some expiring soon, some expired
      await instrument.save();

      const now = new Date();
      const certNumber = `LM-${now.getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${certNumber}`;
      const qrCodeData = await generateQR(verifyUrl);

      await Certificate.create({
        certificateNumber: certNumber,
        applicationId: application._id,
        instrumentId: instrument._id,
        ownerId: instrument.ownerId,
        lmoId: lmo._id,
        verificationDate: base.verificationDate,
        validityFrom: base.verificationDate,
        validityTo: instrument.validityEndDate,
        result: 'Pass',
        observations: base.observations,
        qrCodeData,
        status: instrument.validityEndDate < now ? 'expired' : 'valid',
      });
      certificatesCreated++;
    } else if (status === 'completed' && result === 'fail') {
      instrument.status = 'rejected';
      await instrument.save();
    }
  }

  console.log(`Applications created: ${applicationsCreated}`);
  console.log(`Certificates created: ${certificatesCreated}`);

  console.log('\nLogin reference (Supabase users must be created separately — these are Mongo profiles only):');
  console.log('  admin:', admin.email);
  lmos.forEach((l) => console.log('  lmo:  ', l.email));
  users.forEach((o) => console.log('  user: ', o.email));

  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

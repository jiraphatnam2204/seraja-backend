const mongoose = require("mongoose");
require("dotenv").config({ path: "./config/config.env" });
const User = require("../models/User");
const Campground = require("../models/Campground");
const Booking = require("../models/Booking");

// ─── Database Connection ──────────────────────────────────────────────────────

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedAdmins = [
  {
    name: "Admin Primary",
    tel: "0800000001",
    email: "admin1@example.com",
    role: "admin",
    password: "admin123",
  },
  {
    name: "Admin Secondary",
    tel: "0800000002",
    email: "admin2@example.com",
    role: "admin",
    password: "admin123",
  },
];

const seedCampOwner = {
  name: "Somchai Koh",
  tel: "0812345678",
  email: "somchai.owner@example.com",
  role: "campOwner",
  password: "password123",
};

const seedUsers = [
  {
    name: "John Smith",
    tel: "0898765432",
    email: "john.smith@example.com",
    role: "user",
    password: "password123",
  },
  {
    name: "Sarah Johnson",
    tel: "0897654321",
    email: "sarah.johnson@example.com",
    role: "user",
    password: "password123",
  },
];

// All 10 campgrounds belong to the single camp owner (assigned at runtime)
const seedCampgrounds = [
  {
    name: "Pine Mountain Camp",
    address: "123 Mountain Road",
    district: "Chiang Mai",
    province: "Chiang Mai",
    postalcode: "50000",
    tel: "0811111111",
    region: "North",
    capacity: 50,
  },
  {
    name: "Green Valley Resort",
    address: "456 Valley Lane",
    district: "Kamphaengphet",
    province: "Kamphaengphet",
    postalcode: "62000",
    tel: "0822222222",
    region: "North",
    capacity: 40,
  },
  {
    name: "Riverside Paradise",
    address: "789 River Road",
    district: "Phetchabun",
    province: "Phetchabun",
    postalcode: "67000",
    tel: "0833333333",
    region: "Central",
    capacity: 60,
  },
  {
    name: "Sunset Beach Camp",
    address: "321 Beach Way",
    district: "Rayong",
    province: "Rayong",
    postalcode: "21000",
    tel: "0844444444",
    region: "East",
    capacity: 75,
  },
  {
    name: "Forest Escape Retreat",
    address: "654 Forest Trail",
    district: "Nakhon Ratchasima",
    province: "Nakhon Ratchasima",
    postalcode: "30000",
    tel: "0855555555",
    region: "Isaan",
    capacity: 45,
  },
  {
    name: "Mountain Peak Adventure",
    address: "987 Peak Street",
    district: "Phitsanulok",
    province: "Phitsanulok",
    postalcode: "65000",
    tel: "0866666666",
    region: "North",
    capacity: 55,
  },
  {
    name: "Lakeside Comfort Camp",
    address: "147 Lake View Drive",
    district: "Surat Thani",
    province: "Surat Thani",
    postalcode: "84000",
    tel: "0877777777",
    region: "South",
    capacity: 35,
  },
  {
    name: "Tropical Nature Lodge",
    address: "258 Jungle Path",
    district: "Hat Yai",
    province: "Songkhla",
    postalcode: "90000",
    tel: "0888888888",
    region: "South",
    capacity: 50,
  },
  {
    name: "Desert Oasis Camp",
    address: "369 Oasis Road",
    district: "Nakhon Sawan",
    province: "Nakhon Sawan",
    postalcode: "60000",
    tel: "0899999999",
    region: "Central",
    capacity: 40,
  },
  {
    name: "Starlight Meadows Camp",
    address: "741 Meadow Lane",
    district: "Lampang",
    province: "Lampang",
    postalcode: "52000",
    tel: "0810101010",
    region: "North",
    capacity: 65,
  },
];

// ─── Booking Factory ──────────────────────────────────────────────────────────

/**
 * Generates a booking object with dates expressed as offsets from today.
 * @param {object}  opts
 * @param {object}  today         - Base Date
 * @param {object}  [opts.user]   - Mongoose User document (registered user)
 * @param {string}  [opts.guestName]
 * @param {string}  [opts.guestTel]
 * @param {object}  opts.campground - Mongoose Campground document
 * @param {number}  opts.checkInOffset  - Days relative to today (negative = past)
 * @param {number}  opts.checkOutOffset
 * @param {string}  opts.status   - "confirmed" | "checked-in" | "checked-out" | "cancelled"
 * @param {number}  [opts.cancelledAtOffset] - Required when status === "cancelled"
 * @param {number}  [opts.actualCheckInOffset]
 * @param {number}  [opts.actualCheckOutOffset]
 */
const makeBooking = (today, opts) => {
  const daysMs = (n) => n * 24 * 60 * 60 * 1000;
  const offset = (n) => new Date(today.getTime() + daysMs(n));

  const booking = {
    campground: opts.campground._id,
    checkInDate: offset(opts.checkInOffset),
    checkOutDate: offset(opts.checkOutOffset),
    status: opts.status,
  };

  if (opts.user) booking.user = opts.user._id;
  if (opts.guestName) booking.guestName = opts.guestName;
  if (opts.guestTel) booking.guestTel = opts.guestTel;
  if (opts.actualCheckInOffset !== undefined)
    booking.actualCheckIn = offset(opts.actualCheckInOffset);
  if (opts.actualCheckOutOffset !== undefined)
    booking.actualCheckOut = offset(opts.actualCheckOutOffset);
  if (opts.cancelledAtOffset !== undefined)
    booking.cancelledAt = offset(opts.cancelledAtOffset);

  return booking;
};

// ─── Main Seeder ──────────────────────────────────────────────────────────────

const seedDatabase = async () => {
  try {
    await connectDB();

    // ── Teardown ────────────────────────────────────────────────────────────
    console.log("Clearing existing data...");
    await Booking.deleteMany({});
    await Campground.deleteMany({});
    await User.deleteMany({});

    // ── Admins ──────────────────────────────────────────────────────────────
    console.log("\nCreating admin users...");
    const admins = [];
    for (const data of seedAdmins) {
      const admin = await User.create(data);
      admins.push(admin);
      console.log(`  ✓ Admin: ${admin.email}`);
    }

    // ── Camp Owner ──────────────────────────────────────────────────────────
    console.log("\nCreating camp owner...");
    const campOwner = await User.create(seedCampOwner);
    console.log(`  ✓ Camp owner: ${campOwner.email}`);

    // ── Regular Users ───────────────────────────────────────────────────────
    console.log("\nCreating regular users...");
    const users = [];
    for (const data of seedUsers) {
      const user = await User.create(data);
      users.push(user);
      console.log(`  ✓ User: ${user.email}`);
    }

    // ── Campgrounds (all owned by the single campOwner) ─────────────────────
    console.log("\nCreating campgrounds...");
    const campgrounds = [];
    for (const data of seedCampgrounds) {
      const campground = await Campground.create({ ...data, owner: campOwner._id });
      campgrounds.push(campground);
      console.log(`  ✓ Campground: ${campground.name}`);
    }

    // ── Bookings ────────────────────────────────────────────────────────────
    console.log("\nCreating bookings...");
    const today = new Date();
    const [john, sarah] = users;
    const [cg0, cg1, cg2, cg3, cg4] = campgrounds;

    const bookingSpecs = [
      // Past — checked-out (john)
      {
        user: john,
        campground: cg0,
        checkInOffset: -10,
        checkOutOffset: -8,
        actualCheckInOffset: -10,
        actualCheckOutOffset: -8,
        status: "checked-out",
      },
      // Past — checked-out (sarah)
      {
        user: sarah,
        campground: cg1,
        checkInOffset: -15,
        checkOutOffset: -13,
        actualCheckInOffset: -15,
        actualCheckOutOffset: -13,
        status: "checked-out",
      },
      // Active — checked-in (john)
      {
        user: john,
        campground: cg2,
        checkInOffset: -2,
        checkOutOffset: 1,
        actualCheckInOffset: -2,
        status: "checked-in",
      },
      // Active — checked-in (sarah)
      {
        user: sarah,
        campground: cg3,
        checkInOffset: -1,
        checkOutOffset: 2,
        actualCheckInOffset: -1,
        status: "checked-in",
      },
      // Future — confirmed (john)
      {
        user: john,
        campground: cg4,
        checkInOffset: 5,
        checkOutOffset: 7,
        status: "confirmed",
      },
      // Future — confirmed (sarah)
      {
        user: sarah,
        campground: campgrounds[5],
        checkInOffset: 10,
        checkOutOffset: 12,
        status: "confirmed",
      },
      // Future — guest booking (no registered account)
      {
        guestName: "Tom Hardy",
        guestTel: "0612345678",
        campground: campgrounds[6],
        checkInOffset: 3,
        checkOutOffset: 5,
        status: "confirmed",
      },
      // Future — guest booking
      {
        guestName: "Grace Lee",
        guestTel: "0623456789",
        campground: campgrounds[7],
        checkInOffset: 14,
        checkOutOffset: 16,
        status: "confirmed",
      },
      // Cancelled — past (john)
      {
        user: john,
        campground: campgrounds[8],
        checkInOffset: -7,
        checkOutOffset: -5,
        cancelledAtOffset: -8,
        status: "cancelled",
      },
      // Cancelled — future (sarah)
      {
        user: sarah,
        campground: campgrounds[9],
        checkInOffset: 20,
        checkOutOffset: 22,
        cancelledAtOffset: -1,
        status: "cancelled",
      },
    ];

    for (const spec of bookingSpecs) {
      const booking = makeBooking(today, spec);
      await Booking.create(booking);
      const actor = spec.user
        ? `user: ${spec.user.email}`
        : `guest: ${spec.guestName}`;
      console.log(`  ✓ Booking [${spec.status}] — ${actor} @ ${spec.campground.name}`);
    }

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log("\n✓✓✓ Database seeding completed successfully! ✓✓✓");
    console.log(`\nSummary:`);
    console.log(`  Admins       : ${admins.length}`);
    console.log(`  Camp owners  : 1  (${campOwner.email})`);
    console.log(`  Users        : ${users.length}`);
    console.log(`  Campgrounds  : ${campgrounds.length}  (all owned by ${campOwner.email})`);
    console.log(`  Bookings     : ${bookingSpecs.length}`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

// ─── Entry Point ──────────────────────────────────────────────────────────────

seedDatabase();
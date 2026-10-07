import mongoose from "mongoose";
import dotenv from "dotenv";
import { resolve } from "path";
import DemoUser from "../src/models/DemoUser.js";
import Activity from "../src/models/Activity.js";
import Alert from "../src/models/Alert.js";

// Load .env
dotenv.config({ path: resolve(process.cwd(), ".env") });

// Simple Deterministic PRNG
let seed = 123456789;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function randomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

const DEMO_USERS_CONFIG = [
  { userId: "DU-001", name: "Alice Security", email: "alice@example.com", department: "Security", role: "security analyst", normalWorkingHours: { start: "08:00", end: "17:00" }, normalDevices: ["MAC-101", "IPHONE-201"] },
  { userId: "DU-002", name: "Bob Engineer", email: "bob@example.com", department: "Engineering", role: "software engineer", normalWorkingHours: { start: "09:00", end: "18:00" }, normalDevices: ["LNX-302"] },
  { userId: "DU-003", name: "Charlie Dev", email: "charlie@example.com", department: "Engineering", role: "developer", normalWorkingHours: { start: "10:00", end: "19:00" }, normalDevices: ["MAC-102"] },
  { userId: "DU-004", name: "Diana HR", email: "diana@example.com", department: "HR", role: "HR analyst", normalWorkingHours: { start: "08:30", end: "17:30" }, normalDevices: ["WIN-401"] },
  { userId: "DU-005", name: "Eve Finance", email: "eve@example.com", department: "Finance", role: "finance analyst", normalWorkingHours: { start: "09:00", end: "17:00" }, normalDevices: ["WIN-402"] },
  { userId: "DU-006", name: "Frank Sysadmin", email: "frank@example.com", department: "IT", role: "system administrator", normalWorkingHours: { start: "07:00", end: "16:00" }, normalDevices: ["LNX-303", "IPHONE-202"] },
  { userId: "DU-007", name: "Grace Admin", email: "grace@example.com", department: "Executive", role: "privileged administrator", normalWorkingHours: { start: "09:00", end: "18:00" }, normalDevices: ["MAC-103", "IPAD-501"] },
  { userId: "DU-008", name: "Heidi Marketing", email: "heidi@example.com", department: "Marketing", role: "marketing manager", normalWorkingHours: { start: "09:30", end: "18:30" }, normalDevices: ["MAC-104"] },
  { userId: "DU-009", name: "Ivan Sales", email: "ivan@example.com", department: "Sales", role: "sales representative", normalWorkingHours: { start: "08:00", end: "17:00" }, normalDevices: ["WIN-403", "IPHONE-203"] },
  { userId: "DU-010", name: "Judy Legal", email: "judy@example.com", department: "Legal", role: "legal counsel", normalWorkingHours: { start: "09:00", end: "17:30" }, normalDevices: ["MAC-105"] }
];

const ACTIVITY_TYPES = [
  "LOGIN", "LOGOUT", "FILE_ACCESS", "FILE_DOWNLOAD", 
  "FILE_UPLOAD", "DEVICE_CONNECTED", "EMAIL_SENT", 
  "HTTP_ACCESS" // Removed SENSITIVE_RESOURCE_ACCESS for normal activity
];

function generateEventId(index) {
  return `EVT-${100000 + index}`;
}

async function seedData() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sentinelai";
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Clear existing demo data
    await DemoUser.deleteMany({});
    await Activity.deleteMany({});
    await Alert.deleteMany({});
    console.log("Cleared existing demo data and alerts");

    // Insert Users
    await DemoUser.insertMany(DEMO_USERS_CONFIG);
    console.log(`Inserted ${DEMO_USERS_CONFIG.length} demo users`);

    const events = [];
    let eventCount = 0;
    
    // Generate dates spanning past 7 days
    const endDate = new Date("2026-09-07T23:59:59Z");
    const startDate = new Date("2026-09-01T00:00:00Z");

    const scenarioCounts = {
      normal_activity: 0,
      unusual_login: 0,
      new_device: 0,
      abnormal_file_access: 0,
      abnormal_data_transfer: 0,
      combined_insider_behavior: 0
    };

    // Generate normal activity for each user
    for (const user of DEMO_USERS_CONFIG) {
      // 50-100 normal events per user
      const numEvents = randomInt(50, 100);
      for (let i = 0; i < numEvents; i++) {
        // Pick a day offset, and time within normal working hours
        const dayOffset = randomInt(0, 6);
        const eventDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
        
        const startHour = parseInt(user.normalWorkingHours.start.split(":")[0], 10);
        const endHour = parseInt(user.normalWorkingHours.end.split(":")[0], 10);
        eventDate.setUTCHours(randomInt(startHour, endHour - 1), randomInt(0, 59), 0, 0);
        
        const actType = randomChoice(ACTIVITY_TYPES);
        let metadata = {};
        if (actType === "FILE_DOWNLOAD" || actType === "FILE_UPLOAD") {
          metadata.bytesTransferred = randomInt(1024, 1024 * 1024 * 50); // 1KB to 50MB
        }

        events.push({
          eventId: generateEventId(eventCount++),
          userId: user.userId,
          timestamp: eventDate,
          activityType: actType,
          source: "Internal Network",
          action: "Allowed",
          resource: `Resource-${randomInt(1, 100)}`,
          deviceId: randomChoice(user.normalDevices),
          ipAddress: `192.168.1.${randomInt(10, 250)}`,
          metadata: metadata,
          scenario: "normal_activity"
        });
        scenarioCounts.normal_activity++;
      }
    }

    // Generate suspicious scenarios
    const suspiciousScenarios = [
      {
        type: "unusual_login",
        user: DEMO_USERS_CONFIG[1], // Bob
        count: 10
      },
      {
        type: "new_device",
        user: DEMO_USERS_CONFIG[3], // Diana
        count: 5
      },
      {
        type: "abnormal_file_access",
        user: DEMO_USERS_CONFIG[5], // Frank
        count: 15
      },
      {
        type: "abnormal_data_transfer",
        user: DEMO_USERS_CONFIG[6], // Grace
        count: 8
      },
      {
        type: "combined_insider_behavior",
        user: DEMO_USERS_CONFIG[2], // Charlie
        count: 12
      }
    ];

    for (const s of suspiciousScenarios) {
      const user = s.user;
      for (let i = 0; i < s.count; i++) {
        // Suspicious events happen on the last day (Sept 7) so they are caught in the 24h analysis window
        const eventDate = new Date("2026-09-07T00:00:00Z");
        eventDate.setUTCHours(randomInt(1, 4), randomInt(0, 59), 0, 0); 

        let actType = "LOGIN";
        let deviceId = "UNKNOWN-999";
        let resource = `Sensitive-Resource-${randomInt(1, 10)}`;

        if (s.type === "abnormal_file_access") actType = "SENSITIVE_RESOURCE_ACCESS";
        if (s.type === "abnormal_data_transfer") actType = "FILE_DOWNLOAD";
        if (s.type === "combined_insider_behavior") {
          const types = ["LOGIN", "SENSITIVE_RESOURCE_ACCESS", "FILE_DOWNLOAD"];
          actType = types[i % types.length];
        }

        let metadata = { anomaly: true };
        if (actType === "FILE_DOWNLOAD" || actType === "FILE_UPLOAD") {
          if (s.type === "abnormal_data_transfer" || s.type === "combined_insider_behavior") {
            metadata.bytesTransferred = randomInt(1024 * 1024 * 500, 1024 * 1024 * 2000); // 500MB to 2GB
          } else {
            metadata.bytesTransferred = randomInt(1024, 1024 * 1024 * 50); // 1KB to 50MB
          }
        }

        events.push({
          eventId: generateEventId(eventCount++),
          userId: user.userId,
          timestamp: eventDate,
          activityType: actType,
          source: "External Network",
          action: "Allowed",
          resource: resource,
          deviceId: deviceId,
          ipAddress: `203.0.113.${randomInt(1, 250)}`,
          metadata: metadata,
          scenario: s.type
        });
        scenarioCounts[s.type]++;
      }
    }

    await Activity.insertMany(events);

    console.log("\nDemo data seeded successfully.\n");
    console.log(`Users: ${DEMO_USERS_CONFIG.length}`);
    console.log(`Events: ${events.length}`);
    console.log(`Date range: 2026-09-01 → 2026-09-07\n`);
    console.log("Scenarios:");
    for (const [scenario, count] of Object.entries(scenarioCounts)) {
      console.log(`${scenario}: ${count}`);
    }

  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

seedData();

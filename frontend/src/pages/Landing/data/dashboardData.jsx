export const dashboardData = {
  // ==========================
  // Login Trend
  // ==========================
  loginTrend: [
    { day: "M", value: 28 },
    { day: "T", value: 46 },
    { day: "W", value: 39 },
    { day: "T", value: 64 },
    { day: "F", value: 52 },
    { day: "S", value: 74 },
    { day: "S", value: 92 },
  ],

  totalLogins: 142,
  loginGrowth: 18,

  // ==========================
  // AI Risk
  // ==========================
  riskScore: 94,
  aiConfidence: 98.7,
  threatLevel: "Critical",

  recommendations: [
    "Require Multi-Factor Authentication",
    "Lock Suspicious Session",
    "Notify Security Team",
  ],

  // ==========================
  // AI Insights
  // ==========================
  insights: {
    threatsBlocked: 98,
    activeUsers: 420,
    aiConfidence: 98.7,
    behaviourScore: 94,
  },

  // ==========================
  // User Activity Heatmap
  // ==========================
  heatmap: [
    ["yellow", "red", "red", "yellow", "blue", "red"],
    ["red", "blue", "blue", "blue", "blue", "blue"],
    ["yellow", "blue", "yellow", "red", "blue", "red"],
    ["blue", "blue", "blue", "red", "red", "yellow"],
  ],

  // ==========================
  // Live Alert Feed
  // ==========================
  alerts: [
    {
      id: 1,
      title: "Impossible Travel",
      user: "Amit Verma",
      location: "Singapore",
      severity: "High",
      time: "15 sec ago",
    },
    {
      id: 2,
      title: "Password Reset",
      user: "Neha",
      location: "Chennai",
      severity: "Safe",
      time: "1 min ago",
    },
    {
      id: 3,
      title: "Unknown Device Login",
      user: "Rahul Sharma",
      location: "Mumbai",
      severity: "Critical",
      time: "Just now",
    },
  ],
};

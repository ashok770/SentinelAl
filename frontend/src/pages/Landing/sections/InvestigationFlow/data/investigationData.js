export const investigationSteps = [
  {
    icon: "login",
    time: "09:42",
    title: "Login Detected",
    description: "Rahul logged in from Mumbai.",
    status: "Completed",
  },

  {
    icon: "device",
    time: "09:42",
    title: "Device Verification",
    description: "Unknown Chrome browser detected.",
    status: "Completed",
  },

  {
    icon: "behaviour",
    time: "09:43",
    title: "Behaviour Analysis",
    description: "Travel impossible. Behaviour differs from baseline.",
    status: "Completed",
  },

  {
    icon: "correlation",
    time: "09:43",
    title: "AI Correlation",
    description: "Compared against historical login patterns.",
    status: "Completed",
  },

  {
    icon: "decision",
    time: "09:44",
    title: "Final Decision",
    description: "Possible Account Takeover.",
    status: "Critical",
  },
];

export const decisionData = {
  title: "Possible Account Takeover",
  subtitle: "Multiple behavioural anomalies detected.",
  risk: "High Risk",
  confidence: "98.7%",
  score: "94 / 100",

  reasons: [
    "Unknown Chrome browser detected.",
    "Impossible travel identified.",
    "Behaviour differs from historical baseline.",
  ],
};
export const recommendations = [
  {
    priority: "High",
    action: "Require Multi-Factor Authentication",
    color: "red",
  },
  {
    priority: "Medium",
    action: "Lock Suspicious Session",
    color: "orange",
  },
  {
    priority: "Medium",
    action: "Notify Security Team",
    color: "yellow",
  },
  {
    priority: "Low",
    action: "Force Password Reset",
    color: "green",
  },
];

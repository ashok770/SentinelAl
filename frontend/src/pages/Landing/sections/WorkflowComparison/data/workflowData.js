export const traditionalWorkflow = [
  {
    title: "Security Alert",
    description: "Suspicious login detected.",
  },
  {
    title: "Open SIEM",
    description: "Search authentication logs.",
  },
  {
    title: "Switch to EDR",
    description: "Investigate endpoint activity.",
  },
  {
    title: "Correlate Evidence",
    description: "Compare devices, IPs and behaviour.",
  },
  {
    title: "Manual Decision",
    description: "Analyst decides the response.",
  },
];

export const sentinelWorkflow = [
  {
    title: "Security Alert",
    description: "Suspicious login detected.",
  },
  {
    title: "AI Investigation",
    description: "Behaviour, device and identity analysed together.",
  },
  {
    title: "Explainable Decision",
    description: "AI calculates risk with reasoning.",
  },
  {
    title: "Recommended Response",
    description: "Best mitigation suggested instantly.",
  },
  {
    title: "One-Click Action",
    description: "Analyst approves the response.",
  },
];

export const workflowStats = [
  {
    label: "Investigation Time",
    traditional: "12 min",
    sentinel: "47 sec",
  },
  {
    label: "Platforms Used",
    traditional: "6",
    sentinel: "1",
  },
  {
    label: "Decision",
    traditional: "Manual",
    sentinel: "Explainable AI",
  },
];

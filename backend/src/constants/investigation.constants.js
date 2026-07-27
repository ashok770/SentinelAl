// Investigation Status

export const INVESTIGATION_STATUS = Object.freeze({
  OPEN: "Open",
  INVESTIGATING: "Investigating",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
});

// Investigation Severity

export const INVESTIGATION_SEVERITY = Object.freeze({
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
});

// Investigation Source

export const INVESTIGATION_SOURCE = Object.freeze({
  AI: "AI",
  WAZUH: "Wazuh",
  SIEM: "SIEM",
  IDENTITY_PROVIDER: "Identity Provider",
  MANUAL: "Manual",
});

/**
 * SentinelAI — Operational Alert Constants (Phase 4A)
 * ====================================================
 * Defines canonical severities and lifecycle statuses for operational alerts.
 */

export const ALERT_SEVERITY = Object.freeze({
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  ELEVATED: "ELEVATED",
});

export const ALERT_STATUS = Object.freeze({
  OPEN: "OPEN",
  ACKNOWLEDGED: "ACKNOWLEDGED",
  INVESTIGATING: "INVESTIGATING",
  RESOLVED: "RESOLVED",
  FALSE_POSITIVE: "FALSE_POSITIVE",
});

export const EVIDENCE_SEVERITY = Object.freeze({
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
});

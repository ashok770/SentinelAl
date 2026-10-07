/**
 * SentinelAI — Operational Alert Constants
 * ========================================
 * Canonical constants for severities, lifecycle statuses, and sorting options.
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

export const STATUS_LABELS = Object.freeze({
  OPEN: "Open",
  ACKNOWLEDGED: "Acknowledged",
  INVESTIGATING: "Investigating",
  RESOLVED: "Resolved",
  FALSE_POSITIVE: "False Positive",
});

export const SORT_OPTIONS = [
  { value: "peakScore", label: "Peak Score" },
  { value: "firstSeen", label: "First Seen" },
  { value: "lastSeen", label: "Last Seen" },
  { value: "durationDays", label: "Duration" },
  { value: "severity", label: "Severity" },
  { value: "status", label: "Status" },
];

export const DEPARTMENTS = [
  "3 - Assembly",
  "2 - Sales",
  "6 - Security",
  "3 - FieldService",
  "3 - Engineering",
  "4 - Finance",
  "5 - Purchasing",
  "1 - IT",
  "1 - HumanResources",
  "2 - Marketing",
  "4 - Legal",
  "5 - Logistics",
  "6 - Operations",
];

export const BUSINESS_UNITS = [
  "Operations",
  "SalesAndMarketing",
  "Corporate",
  "SecurityAndIT",
  "FinanceAndLegal",
];

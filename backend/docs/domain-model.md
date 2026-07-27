# SentinelAI Domain Model

## Core Philosophy

SentinelAI is an AI-powered cybersecurity investigation platform.

The Investigation is the heart of the system.

Everything else exists to support an Investigation.

An Investigation is not just an alert.

It is a complete container that collects evidence, AI reasoning,
analyst decisions, and the investigation timeline until the case
is resolved.

---

# Core Domain

## Investigation

### Purpose

Represents a security investigation initiated by SentinelAI or a security analyst.

It combines multiple security signals into one explainable investigation.

---

## Investigation Sources

An Investigation can be created from:

- AI Anomaly Detection
- Wazuh Alerts
- SIEM Alerts
- Identity Provider Alerts
- Manual Analyst Investigation
- Future Third-Party Integrations

---

## Investigation Lifecycle

Open

↓

Investigating

↓

Resolved

↓

Closed

---

## Investigation Objectives

- Explain why an alert occurred.
- Correlate related security events.
- Reduce analyst investigation time.
- Provide explainable AI reasoning.
- Maintain a complete investigation history.
- Recommend mitigation actions.

---

# Investigation Components

Every Investigation owns the following information:

## Alert

Represents the original trigger.

Examples:

- Impossible Travel
- Multiple Failed Login Attempts
- Privilege Escalation
- Suspicious File Access
- Malware Detection

---

## Evidence

Evidence is the most important component of an Investigation.

Instead of storing random security fields directly inside the Investigation,
SentinelAI stores different categories of evidence.

Each evidence item explains WHY the Investigation exists.

Evidence Types:

### Behaviour Evidence

Compares historical behaviour with current behaviour.

Examples:

- Login time anomaly
- Working hour deviation
- Unusual activity pattern
- Behaviour baseline comparison

---

### Identity Evidence

Verifies whether the user's identity appears trustworthy.

Examples:

- MFA Status
- Failed Login Attempts
- Privileged Account
- Account Age

---

### Network Evidence

Evaluates network activity.

Examples:

- Source IP
- VPN Detection
- Geo-location
- Impossible Travel
- ASN Information

---

### Device Evidence

Verifies device trust.

Examples:

- Browser Fingerprint
- Device Fingerprint
- Operating System
- New Device Detection

---

### File Activity Evidence

Evaluates user interaction with organizational resources.

Examples:

- Files Downloaded
- Sensitive Files Accessed
- Resource Usage
- Unusual Download Volume

---

### Threat Intelligence Evidence

External security intelligence.

Examples:

- IP Reputation
- Domain Reputation
- Known Malicious Indicators
- Threat Feed Matches

---

## AI Reasoning

Explains why SentinelAI believes an Investigation is risky.

AI reasoning must always be explainable.

It should never return only a score.

It must provide supporting evidence.

---

## Risk Assessment

Determines the overall investigation severity.

Levels:

- Low
- Medium
- High
- Critical

Risk should be calculated from evidence instead of being manually assigned.

---

## Recommendations

Provides suggested analyst actions.

Examples:

- Require MFA
- Reset Password
- Disable Account
- Isolate Endpoint
- Block IP Address
- Continue Monitoring

---

## Timeline

Every important action performed during an Investigation is recorded.

Examples:

- Alert Created
- AI Analysis Completed
- Analyst Assigned
- Evidence Added
- Investigation Updated
- Investigation Closed

---

## Analyst Notes

Allows analysts to record findings during the investigation.

---

# Design Principles

SentinelAI is investigation-driven.

Investigations own evidence.

Evidence explains AI decisions.

AI supports analysts.

Analysts always have the final decision.

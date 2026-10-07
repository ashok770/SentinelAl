import Alert from "../models/Alert.js";
import AlertEvidence from "../models/AlertEvidence.js";
import MonitoredIdentity from "../models/MonitoredIdentity.js";

/**
 * SentinelAI — Operational Alert Repository (Phase 4B)
 * ====================================================
 * Pure data access layer for Alert, AlertEvidence, and MonitoredIdentity collections.
 * Contains no business logic.
 */

class AlertRepository {
  /**
   * Retrieves paginated alerts matching the specified MongoDB filter.
   */
  async findAlerts({ filter = {}, skip = 0, limit = 25, sort = { firstSeen: -1 } }) {
    return Alert.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * Counts the total number of alerts matching the specified filter.
   */
  async countAlerts(filter = {}) {
    return Alert.countDocuments(filter);
  }

  /**
   * Finds a single alert by its deterministic alertId.
   */
  async findAlertById(alertId) {
    return Alert.findOne({ alertId }).lean();
  }

  /**
   * Updates only operational fields on an alert document by alertId.
   */
  async updateAlertStatus(alertId, updateFields) {
    return Alert.findOneAndUpdate(
      { alertId },
      { $set: updateFields },
      { returnDocument: "after", runValidators: true }
    ).lean();
  }

  /**
   * Finds paginated evidence records for a specific alert.
   */
  async findEvidenceByAlertId({ alertId, filter = {}, skip = 0, limit = 100 }) {
    const query = { alertId, ...filter };
    return AlertEvidence.find(query)
      .sort({ severity: 1, dimensionValue: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * Counts total evidence records matching query for an alert.
   */
  async countEvidenceByAlertId(alertId, filter = {}) {
    const query = { alertId, ...filter };
    return AlertEvidence.countDocuments(query);
  }

  /**
   * Finds a monitored employee organizational identity profile by userId.
   */
  async findMonitoredIdentityByUserId(userId) {
    return MonitoredIdentity.findOne({ userId }).lean();
  }
}

export default new AlertRepository();

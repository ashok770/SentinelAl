import Alert from "../models/Alert.js";
import MonitoredIdentity from "../models/MonitoredIdentity.js";
import { ALERT_SEVERITY, ALERT_STATUS } from "../constants/alert.constants.js";

/**
 * SentinelAI — Dashboard Repository (Phase 4C)
 * ============================================
 * Pure data-access layer executing optimized MongoDB aggregation pipelines
 * for high-level SOC security overview metrics.
 */

class DashboardRepository {
  /**
   * Aggregates primary KPI counts.
   */
  async getKpiTotals() {
    const [totalAlerts, criticalAlerts, openAlerts, highRiskUserAgg] = await Promise.all([
      Alert.countDocuments(),
      Alert.countDocuments({ severity: ALERT_SEVERITY.CRITICAL }),
      Alert.countDocuments({
        status: { $in: [ALERT_STATUS.OPEN, ALERT_STATUS.ACKNOWLEDGED, ALERT_STATUS.INVESTIGATING] },
      }),
      Alert.aggregate([
        { $match: { severity: { $in: [ALERT_SEVERITY.CRITICAL, ALERT_SEVERITY.HIGH] } } },
        { $group: { _id: "$userId" } },
        { $count: "count" },
      ]),
    ]);

    const highRiskIdentities = highRiskUserAgg[0]?.count || 0;

    return {
      alerts: totalAlerts,
      critical: criticalAlerts,
      openInvestigations: openAlerts,
      highRiskIdentities,
    };
  }

  /**
   * Aggregates alert distribution across operational severity tiers.
   */
  async getSeverityDistribution() {
    const total = await Alert.countDocuments();
    if (total === 0) return [];

    const agg = await Alert.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
      { $project: { _id: 0, severity: "$_id", count: 1 } },
    ]);

    // Ensure all canonical severities are present
    const countsMap = {
      [ALERT_SEVERITY.CRITICAL]: 0,
      [ALERT_SEVERITY.HIGH]: 0,
      [ALERT_SEVERITY.ELEVATED]: 0,
    };

    agg.forEach((item) => {
      countsMap[item.severity] = item.count;
    });

    return [
      {
        severity: ALERT_SEVERITY.CRITICAL,
        count: countsMap[ALERT_SEVERITY.CRITICAL],
        percentage: Number(((countsMap[ALERT_SEVERITY.CRITICAL] / total) * 100).toFixed(2)),
      },
      {
        severity: ALERT_SEVERITY.HIGH,
        count: countsMap[ALERT_SEVERITY.HIGH],
        percentage: Number(((countsMap[ALERT_SEVERITY.HIGH] / total) * 100).toFixed(2)),
      },
      {
        severity: ALERT_SEVERITY.ELEVATED,
        count: countsMap[ALERT_SEVERITY.ELEVATED],
        percentage: Number(((countsMap[ALERT_SEVERITY.ELEVATED] / total) * 100).toFixed(2)),
      },
    ];
  }

  /**
   * Aggregates alert distribution across operational lifecycle statuses.
   */
  async getStatusDistribution() {
    const agg = await Alert.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);

    const statusMap = {
      [ALERT_STATUS.OPEN]: 0,
      [ALERT_STATUS.ACKNOWLEDGED]: 0,
      [ALERT_STATUS.INVESTIGATING]: 0,
      [ALERT_STATUS.RESOLVED]: 0,
      [ALERT_STATUS.FALSE_POSITIVE]: 0,
    };

    agg.forEach((item) => {
      if (item.status in statusMap) {
        statusMap[item.status] = item.count;
      }
    });

    return Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));
  }

  /**
   * Aggregates monthly alert volumes and critical incident frequencies over time.
   */
  async getAlertTrend() {
    const trend = await Alert.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$firstSeen" } },
          total: { $sum: 1 },
          critical: {
            $sum: { $cond: [{ $eq: ["$severity", ALERT_SEVERITY.CRITICAL] }, 1, 0] },
          },
          high: {
            $sum: { $cond: [{ $eq: ["$severity", ALERT_SEVERITY.HIGH] }, 1, 0] },
          },
          elevated: {
            $sum: { $cond: [{ $eq: ["$severity", ALERT_SEVERITY.ELEVATED] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: "$total",
          critical: 1,
          high: 1,
          elevated: 1,
        },
      },
    ]);

    return trend;
  }

  /**
   * Aggregates top organizational departments by operational alert volume.
   */
  async getTopDepartments(limit = 5) {
    return Alert.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, department: "$_id", count: 1 } },
    ]);
  }

  /**
   * Retrieves high-priority investigation queue items.
   */
  async getPriorityQueue(limit = 6) {
    return Alert.find()
      .sort({ peakScore: -1, firstSeen: -1 })
      .limit(limit)
      .select({
        alertId: 1,
        userId: 1,
        employeeName: 1,
        department: 1,
        role: 1,
        severity: 1,
        peakScore: 1,
        firstSeen: 1,
        lastSeen: 1,
        durationDays: 1,
        status: 1,
        activitySummary: 1,
      })
      .lean();
  }
}

export default new DashboardRepository();

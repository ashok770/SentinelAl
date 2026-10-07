import dashboardRepository from "../repositories/dashboard.repository.js";

/**
 * SentinelAI — Dashboard Service (Phase 4C)
 * =========================================
 * Business logic layer for high-level SOC security overview metrics.
 * Coordinates with DashboardRepository to provide aggregated operational metrics.
 */
class DashboardService {
  /**
   * Retrieves comprehensive dashboard summary payload.
   */
  async getSummary() {
    const [
      totals,
      severityDistribution,
      statusDistribution,
      alertTrend,
      topDepartments,
      priorityQueue,
    ] = await Promise.all([
      dashboardRepository.getKpiTotals(),
      dashboardRepository.getSeverityDistribution(),
      dashboardRepository.getStatusDistribution(),
      dashboardRepository.getAlertTrend(),
      dashboardRepository.getTopDepartments(5),
      dashboardRepository.getPriorityQueue(6),
    ]);

    return {
      totals,
      severityDistribution,
      statusDistribution,
      alertTrend,
      topDepartments,
      priorityQueue,
    };
  }

  /**
   * Alias for getSummary to support legacy/root dashboard endpoint.
   */
  async getOverview() {
    return this.getSummary();
  }

  /**
   * Returns severity distribution only.
   */
  async getSeverityDistribution() {
    return dashboardRepository.getSeverityDistribution();
  }

  /**
   * Returns alert trend data over time.
   */
  async getAlertTrend() {
    return dashboardRepository.getAlertTrend();
  }

  /**
   * Returns top departments by operational alert volume.
   */
  async getTopDepartments(limit = 5) {
    return dashboardRepository.getTopDepartments(limit);
  }

  /**
   * Returns priority investigation queue alerts.
   */
  async getPriorityQueue(limit = 6) {
    return dashboardRepository.getPriorityQueue(limit);
  }
}

export default new DashboardService();

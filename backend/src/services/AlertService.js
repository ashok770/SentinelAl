import alertRepository from "../repositories/alert.repository.js";
import { ALERT_SEVERITY, ALERT_STATUS, EVIDENCE_SEVERITY } from "../constants/alert.constants.js";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors.js";

/**
 * SentinelAI — Operational Alert Service (Phase 4B)
 * =================================================
 * Encapsulates business logic, operational state machine, validation,
 * and data transformation for operational alert triage and investigation.
 */

const ALLOWED_SORT_FIELDS = new Set([
  "firstSeen",
  "lastSeen",
  "peakScore",
  "meanScore",
  "severity",
  "status",
  "createdAt",
  "updatedAt",
  "durationDays",
  "anomalousDays",
]);

const ALLOWED_STATUS_TRANSITIONS = {
  [ALERT_STATUS.OPEN]: new Set([
    ALERT_STATUS.OPEN,
    ALERT_STATUS.ACKNOWLEDGED,
    ALERT_STATUS.INVESTIGATING,
    ALERT_STATUS.RESOLVED,
    ALERT_STATUS.FALSE_POSITIVE,
  ]),
  [ALERT_STATUS.ACKNOWLEDGED]: new Set([
    ALERT_STATUS.ACKNOWLEDGED,
    ALERT_STATUS.INVESTIGATING,
    ALERT_STATUS.RESOLVED,
    ALERT_STATUS.FALSE_POSITIVE,
    ALERT_STATUS.OPEN,
  ]),
  [ALERT_STATUS.INVESTIGATING]: new Set([
    ALERT_STATUS.INVESTIGATING,
    ALERT_STATUS.RESOLVED,
    ALERT_STATUS.FALSE_POSITIVE,
    ALERT_STATUS.ACKNOWLEDGED,
  ]),
  [ALERT_STATUS.RESOLVED]: new Set([
    ALERT_STATUS.RESOLVED,
    ALERT_STATUS.INVESTIGATING, // Reopened investigation allowed
  ]),
  [ALERT_STATUS.FALSE_POSITIVE]: new Set([
    ALERT_STATUS.FALSE_POSITIVE,
    ALERT_STATUS.INVESTIGATING, // Reopened investigation allowed
  ]),
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

class AlertService {
  /**
   * Lists operational alerts with rigorous filtering, pagination, and sorting.
   */
  async listAlerts(queryParams = {}) {
    const {
      page: rawPage = 1,
      limit: rawLimit = 25,
      severity,
      status,
      userId,
      department,
      role,
      businessUnit,
      from,
      to,
      search,
      sortBy: rawSortBy = "firstSeen",
      sortOrder: rawSortOrder = "desc",
    } = queryParams;

    // 1. Pagination Validation
    const page = parseInt(rawPage, 10);
    const limit = parseInt(rawLimit, 10);

    if (isNaN(page) || page < 1) {
      throw new ValidationError("Parameter 'page' must be an integer >= 1");
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ValidationError("Parameter 'limit' must be an integer between 1 and 100");
    }

    // 2. Sorting Validation
    const sortBy = String(rawSortBy).trim();
    if (!ALLOWED_SORT_FIELDS.has(sortBy)) {
      throw new ValidationError(
        `Invalid sortBy parameter '${sortBy}'. Allowed fields: ${Array.from(ALLOWED_SORT_FIELDS).join(", ")}`
      );
    }

    const sortOrderNorm = String(rawSortOrder).toLowerCase().trim();
    let sortDirection = -1;
    if (sortOrderNorm === "asc" || sortOrderNorm === "1") {
      sortDirection = 1;
    } else if (sortOrderNorm === "desc" || sortOrderNorm === "-1") {
      sortDirection = -1;
    } else {
      throw new ValidationError("Parameter 'sortOrder' must be 'asc' or 'desc'");
    }

    // 3. Filter Construction
    const filter = {};

    if (severity) {
      const sevUpper = String(severity).toUpperCase().trim();
      if (!Object.values(ALERT_SEVERITY).includes(sevUpper)) {
        throw new ValidationError(
          `Invalid severity '${severity}'. Allowed: ${Object.values(ALERT_SEVERITY).join(", ")}`
        );
      }
      filter.severity = sevUpper;
    }

    if (status) {
      const statusUpper = String(status).toUpperCase().trim();
      if (!Object.values(ALERT_STATUS).includes(statusUpper)) {
        throw new ValidationError(
          `Invalid status '${status}'. Allowed: ${Object.values(ALERT_STATUS).join(", ")}`
        );
      }
      filter.status = statusUpper;
    }

    if (userId) {
      filter.userId = String(userId).trim();
    }

    if (department) {
      filter.department = new RegExp(`^${escapeRegex(String(department).trim())}$`, "i");
    }

    if (role) {
      filter.role = new RegExp(`^${escapeRegex(String(role).trim())}$`, "i");
    }

    if (businessUnit) {
      filter.businessUnit = String(businessUnit).trim();
    }

    // Date range filtering on firstSeen
    if (from || to) {
      filter.firstSeen = {};
      if (from) {
        const fromDate = new Date(from);
        if (isNaN(fromDate.getTime())) {
          throw new ValidationError(`Invalid 'from' date format: ${from}`);
        }
        filter.firstSeen.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (isNaN(toDate.getTime())) {
          throw new ValidationError(`Invalid 'to' date format: ${to}`);
        }
        filter.firstSeen.$lte = toDate;
      }
    }

    // Keyword search across indexed text identity fields
    if (search && String(search).trim()) {
      const searchRegex = new RegExp(escapeRegex(String(search).trim()), "i");
      filter.$or = [
        { alertId: searchRegex },
        { userId: searchRegex },
        { employeeName: searchRegex },
        { email: searchRegex },
        { role: searchRegex },
        { department: searchRegex },
      ];
    }

    // 4. Query Execution
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortDirection };

    const [alerts, total] = await Promise.all([
      alertRepository.findAlerts({ filter, skip, limit, sort }),
      alertRepository.countAlerts(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      alerts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Retrieves full details for a single operational alert by alertId.
   */
  async getAlertById(alertId) {
    if (!alertId || typeof alertId !== "string") {
      throw new ValidationError("Parameter 'alertId' is required");
    }

    const cleanAlertId = alertId.trim();
    const alert = await alertRepository.findAlertById(cleanAlertId);

    if (!alert) {
      throw new NotFoundError(`Alert with ID '${cleanAlertId}' not found`);
    }

    // Fetch associated monitored employee profile
    const monitoredIdentity = await alertRepository.findMonitoredIdentityByUserId(alert.userId);

    return {
      alert,
      monitoredIdentity: monitoredIdentity || {
        userId: alert.userId,
        employeeName: alert.employeeName,
        email: alert.email,
        role: alert.role,
        businessUnit: alert.businessUnit,
        department: alert.department,
        team: alert.team,
        supervisor: alert.supervisor,
      },
    };
  }

  /**
   * Retrieves paginated evidence items for a specific alert.
   */
  async getAlertEvidence(alertId, queryParams = {}) {
    if (!alertId || typeof alertId !== "string") {
      throw new ValidationError("Parameter 'alertId' is required");
    }

    const cleanAlertId = alertId.trim();
    // 1. Verify alert exists
    const alertExists = await alertRepository.findAlertById(cleanAlertId);
    if (!alertExists) {
      throw new NotFoundError(`Alert with ID '${cleanAlertId}' not found`);
    }

    // 2. Parse pagination and filters
    const {
      page: rawPage = 1,
      limit: rawLimit = 50,
      severity,
      evidenceType,
    } = queryParams;

    const page = parseInt(rawPage, 10);
    const limit = parseInt(rawLimit, 10);

    if (isNaN(page) || page < 1) {
      throw new ValidationError("Parameter 'page' must be an integer >= 1");
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ValidationError("Parameter 'limit' must be an integer between 1 and 100");
    }

    const filter = {};
    if (severity) {
      const sevUpper = String(severity).toUpperCase().trim();
      if (!Object.values(EVIDENCE_SEVERITY).includes(sevUpper)) {
        throw new ValidationError(`Invalid evidence severity '${severity}'`);
      }
      filter.severity = sevUpper;
    }

    if (evidenceType) {
      filter.evidenceType = String(evidenceType).trim();
    }

    const skip = (page - 1) * limit;

    const [evidence, total] = await Promise.all([
      alertRepository.findEvidenceByAlertId({ alertId: cleanAlertId, filter, skip, limit }),
      alertRepository.countEvidenceByAlertId(cleanAlertId, filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      alertId: cleanAlertId,
      evidence,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Updates only the operational status of an alert while strictly enforcing
   * valid state transitions, updating action timestamps, and blocking ML tampering.
   */
  async updateAlertStatus(alertId, body = {}, user = null) {
    if (!alertId || typeof alertId !== "string") {
      throw new ValidationError("Parameter 'alertId' is required");
    }

    // 1. Strict Payload Integrity Check: Reject attempts to modify ML or identity fields
    const bodyKeys = Object.keys(body);
    const forbiddenKeys = bodyKeys.filter((k) => k !== "status");
    if (forbiddenKeys.length > 0) {
      throw new ValidationError(
        `Only operational status can be updated. Forbidden fields provided: ${forbiddenKeys.join(", ")}`
      );
    }

    if (!body.status) {
      throw new ValidationError("Field 'status' is required in request body");
    }

    const targetStatus = String(body.status).toUpperCase().trim();
    if (!Object.values(ALERT_STATUS).includes(targetStatus)) {
      throw new ValidationError(
        `Invalid status '${body.status}'. Allowed: ${Object.values(ALERT_STATUS).join(", ")}`
      );
    }

    const cleanAlertId = alertId.trim();
    const existingAlert = await alertRepository.findAlertById(cleanAlertId);

    if (!existingAlert) {
      throw new NotFoundError(`Alert with ID '${cleanAlertId}' not found`);
    }

    const currentStatus = existingAlert.status;

    // 2. State Transition Rules Validation
    const allowedTargets = ALLOWED_STATUS_TRANSITIONS[currentStatus];
    if (!allowedTargets || !allowedTargets.has(targetStatus)) {
      throw new ConflictError(
        `Invalid operational status transition from '${currentStatus}' to '${targetStatus}'`
      );
    }

    // 3. Prepare Operational Updates
    const updateFields = {
      status: targetStatus,
    };

    const now = new Date();

    if (targetStatus === ALERT_STATUS.ACKNOWLEDGED && !existingAlert.acknowledgedAt) {
      updateFields.acknowledgedAt = now;
    } else if (targetStatus === ALERT_STATUS.RESOLVED || targetStatus === ALERT_STATUS.FALSE_POSITIVE) {
      updateFields.resolvedAt = now;
      if (!existingAlert.acknowledgedAt) {
        updateFields.acknowledgedAt = now;
      }
    } else if (targetStatus === ALERT_STATUS.INVESTIGATING) {
      // If reopening from resolved/false_positive
      if (currentStatus === ALERT_STATUS.RESOLVED || currentStatus === ALERT_STATUS.FALSE_POSITIVE) {
        updateFields.resolvedAt = null;
      }
    }

    const updatedAlert = await alertRepository.updateAlertStatus(cleanAlertId, updateFields);

    return updatedAlert;
  }
}

export default new AlertService();

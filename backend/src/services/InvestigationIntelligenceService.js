import Alert from "../models/Alert.js";
import Activity from "../models/Activity.js";
import DemoActivityProvider from "./DemoActivityProvider.js";
import BehavioralAnalysisService from "./BehavioralAnalysisService.js";
import RiskScoringService from "./RiskScoringService.js";

class InvestigationIntelligenceService {
  async getAlertContext(alertId) {
    // 1. Fetch Alert
    const alert = await Alert.findOne({ alertId });
    if (!alert) {
      throw new Error("Alert not found");
    }

    // 2. Fetch User
    const rawUser = await DemoActivityProvider.getDemoUser(alert.userId);
    if (!rawUser) {
      throw new Error("User not found");
    }
    
    // Analyst-relevant user context
    const user = {
      userId: rawUser.userId,
      name: rawUser.name,
      department: rawUser.department,
      role: rawUser.role,
      normalWorkingHours: rawUser.normalWorkingHours,
      normalDevices: rawUser.normalDevices
    };

    // 3. Re-evaluate Behavior & Risk for the specific window
    const behavioralAnalysis = await BehavioralAnalysisService.analyzeUser(
      alert.userId,
      alert.analysisStart,
      alert.analysisEnd
    );
    const riskAssessment = RiskScoringService.calculateRisk(behavioralAnalysis);

    // 4. Timeline
    const activities = await Activity.find({
      userId: alert.userId,
      timestamp: {
        $gte: alert.analysisStart,
        $lte: alert.analysisEnd
      }
    })
    .sort({ timestamp: 1 })
    .lean();

    const activeSignalIds = new Set(riskAssessment.contributingSignals.map(s => s.signal));

    const timeline = activities.map(act => {
      const annotations = [];

      // Annotate UNUSUAL_LOGIN_TIME
      if (activeSignalIds.has("UNUSUAL_LOGIN_TIME") && act.activityType === "LOGIN") {
        const hour = new Date(act.timestamp).getUTCHours();
        const start = parseInt(user.normalWorkingHours.start.split(":")[0]);
        const end = parseInt(user.normalWorkingHours.end.split(":")[0]);
        if (hour < start || hour >= end) {
          annotations.push("UNUSUAL_LOGIN_TIME");
        }
      }

      // Annotate NEW_DEVICE
      if (activeSignalIds.has("NEW_DEVICE") && act.deviceId) {
        if (!behavioralAnalysis.baseline.knownDevices.includes(act.deviceId)) {
          annotations.push("NEW_DEVICE");
        }
      }

      // Annotate SENSITIVE_RESOURCE_ACCESS
      if (activeSignalIds.has("SENSITIVE_RESOURCE_ACCESS") && act.activityType === "SENSITIVE_RESOURCE_ACCESS") {
        annotations.push("SENSITIVE_RESOURCE_ACCESS");
      }

      return {
        eventId: act.eventId,
        timestamp: act.timestamp,
        activityType: act.activityType,
        source: act.source,
        action: act.action,
        resource: act.resource,
        deviceId: act.deviceId,
        ipAddress: act.ipAddress,
        metadata: act.metadata,
        annotations
      };
    });

    // 5. Evidence Summary
    const evidence = riskAssessment.contributingSignals.map(s => ({
      signal: s.signal,
      observed: true,
      description: s.reason || `Detected ${s.signal} behavior`
    }));

    return {
      alert,
      user,
      riskAssessment: {
        riskScore: riskAssessment.riskScore,
        severity: riskAssessment.severity,
        contributingSignals: riskAssessment.contributingSignals,
        analysisStart: alert.analysisStart,
        analysisEnd: alert.analysisEnd
      },
      behavioralAnalysis: {
        baseline: behavioralAnalysis.baseline,
        signals: behavioralAnalysis.signals
      },
      timeline,
      evidence
    };
  }
}

export default new InvestigationIntelligenceService();

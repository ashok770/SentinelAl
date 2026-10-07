class RiskScoringService {
  constructor() {
    this.signalRules = [
      {
        signal: "UNUSUAL_LOGIN_TIME",
        key: "unusualLoginTime",
        weight: 20,
        reason: "Login activity occurred outside the user's normal working hours."
      },
      {
        signal: "NEW_DEVICE",
        key: "newDevice",
        weight: 20,
        reason: "A previously unseen device was observed for this user."
      },
      {
        signal: "ABNORMAL_FILE_ACCESS",
        key: "abnormalFileAccess",
        weight: 25,
        reason: "File access volume significantly exceeded the user's historical baseline."
      },
      {
        signal: "ABNORMAL_DATA_TRANSFER",
        key: "abnormalDataTransfer",
        weight: 25,
        reason: "Data transfer volume significantly exceeded the user's historical baseline."
      },
      {
        signal: "SENSITIVE_RESOURCE_ACCESS",
        key: "sensitiveResourceAccess",
        weight: 10,
        reason: "A sensitive resource was accessed during the analysis window."
      }
    ];
  }

  /**
   * Calculate the severity band based on the risk score
   */
  getSeverity(score) {
    if (score <= 24) return "LOW";
    if (score <= 49) return "MEDIUM";
    if (score <= 74) return "HIGH";
    return "CRITICAL";
  }

  /**
   * Calculate risk assessment from a BehavioralAnalysisResult
   */
  calculateRisk(analysisResult) {
    let riskScore = 0;
    const contributingSignals = [];

    const signals = analysisResult.signals || {};

    for (const rule of this.signalRules) {
      if (signals[rule.key] === true) {
        riskScore += rule.weight;
        contributingSignals.push({
          signal: rule.signal,
          weight: rule.weight,
          reason: rule.reason
        });
      }
    }

    // Clamp score to maximum of 100
    riskScore = Math.min(riskScore, 100);
    // Ensure no negative scores (just in case)
    riskScore = Math.max(riskScore, 0);

    const severity = this.getSeverity(riskScore);

    return {
      userId: analysisResult.userId,
      riskScore,
      severity,
      contributingSignals,
      totalPossibleScore: 100,
      analysisWindow: analysisResult.analysisWindow,
      analyzedEventCount: analysisResult.analyzedEventCount
    };
  }
}

export default new RiskScoringService();

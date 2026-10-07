import BehavioralAnalysisService from "../services/BehavioralAnalysisService.js";
import RiskScoringService from "../services/RiskScoringService.js";
import DemoActivityProvider from "../services/DemoActivityProvider.js";

export const getUserRisk = async (req, res) => {
  try {
    const { userId } = req.params;
    const { analysisStart, analysisEnd } = req.query;

    const analysisResult = await BehavioralAnalysisService.analyzeUser(userId, analysisStart, analysisEnd);
    const riskAssessment = RiskScoringService.calculateRisk(analysisResult);
    
    res.json({
      status: "success",
      data: riskAssessment,
    });
  } catch (error) {
    if (error.message.includes("User not found")) {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error evaluating user risk:", error);
    res.status(500).json({ error: "Failed to perform risk scoring" });
  }
};

export const getAllRisk = async (req, res) => {
  try {
    const { analysisStart, analysisEnd } = req.query;
    const users = await DemoActivityProvider.getDemoUsers();
    
    const results = [];
    for (const user of users) {
      try {
        const analysis = await BehavioralAnalysisService.analyzeUser(user.userId, analysisStart, analysisEnd);
        const risk = RiskScoringService.calculateRisk(analysis);
        results.push(risk);
      } catch (err) {
        console.error(`Error calculating risk for user ${user.userId}:`, err);
      }
    }

    res.json({
      status: "success",
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching all risk assessments:", error);
    res.status(500).json({ error: "Failed to perform risk scoring" });
  }
};

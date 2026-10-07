import BehavioralAnalysisService from "../services/BehavioralAnalysisService.js";
import DemoActivityProvider from "../services/DemoActivityProvider.js";

export const getUserAnalysis = async (req, res) => {
  try {
    const { userId } = req.params;
    const { analysisStart, analysisEnd } = req.query;

    const analysisResult = await BehavioralAnalysisService.analyzeUser(userId, analysisStart, analysisEnd);
    
    res.json({
      status: "success",
      data: analysisResult,
    });
  } catch (error) {
    if (error.message.includes("User not found")) {
      return res.status(404).json({ error: error.message });
    }
    console.error("Error analyzing user:", error);
    res.status(500).json({ error: "Failed to perform behavioral analysis" });
  }
};

export const getAllAnalysis = async (req, res) => {
  try {
    const { analysisStart, analysisEnd } = req.query;
    const users = await DemoActivityProvider.getDemoUsers();
    
    const results = [];
    for (const user of users) {
      try {
        const analysis = await BehavioralAnalysisService.analyzeUser(user.userId, analysisStart, analysisEnd);
        results.push(analysis);
      } catch (err) {
        console.error(`Error analyzing user ${user.userId}:`, err);
      }
    }

    res.json({
      status: "success",
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error("Error fetching all analysis:", error);
    res.status(500).json({ error: "Failed to perform behavioral analysis" });
  }
};

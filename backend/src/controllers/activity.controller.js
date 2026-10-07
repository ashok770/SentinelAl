import DemoActivityProvider from "../services/DemoActivityProvider.js";

export const getActivities = async (req, res) => {
  try {
    const { userId, activityType, startDate, endDate, limit } = req.query;

    const filters = {
      userId,
      activityType,
      startDate,
      endDate,
    };

    const options = { limit };

    const activities = await DemoActivityProvider.getActivities(filters, options);
    
    res.json({
      status: "success",
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
};

export const getActivitiesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { activityType, startDate, endDate, limit } = req.query;

    const filters = {
      activityType,
      startDate,
      endDate,
    };

    const options = { limit };

    const activities = await DemoActivityProvider.getActivitiesByUser(userId, filters, options);
    
    res.json({
      status: "success",
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({ error: "Failed to fetch user activities" });
  }
};

export const getDemoUsers = async (req, res) => {
  try {
    const users = await DemoActivityProvider.getDemoUsers();
    res.json({
      status: "success",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching demo users:", error);
    res.status(500).json({ error: "Failed to fetch demo users" });
  }
};

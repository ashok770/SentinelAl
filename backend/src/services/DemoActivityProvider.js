import Activity from "../models/Activity.js";
import DemoUser from "../models/DemoUser.js";

class DemoActivityProvider {
  /**
   * Get activities with generic filters
   */
  async getActivities(filters = {}, options = {}) {
    const query = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }
    
    if (filters.activityType) {
      query.activityType = filters.activityType;
    }

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    const limit = options.limit ? parseInt(options.limit, 10) : 100;
    const maxLimit = Math.min(limit, 1000); // cap limit

    const activities = await Activity.find(query)
      .sort({ timestamp: -1 })
      .limit(maxLimit)
      .lean();

    return activities;
  }

  /**
   * Get activities for a specific user
   */
  async getActivitiesByUser(userId, filters = {}, options = {}) {
    return this.getActivities({ ...filters, userId }, options);
  }

  /**
   * Get all demo users
   */
  async getDemoUsers() {
    return DemoUser.find().lean();
  }
  
  /**
   * Get a specific demo user
   */
  async getDemoUser(userId) {
    return DemoUser.findOne({ userId }).lean();
  }
}

export default new DemoActivityProvider();

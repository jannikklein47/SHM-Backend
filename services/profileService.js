const Database = require("../utils/Database");

module.exports = {
  getInteractions: async (id) => {
    const { rows } = await Database.pool.query(
      `
      SELECT COUNT(*) as interactions
      FROM History
      WHERE userId = $1
      `,
      [id],
    );
    return rows[0].interactions;
  },
  getHouseholdInfo: async (id) => {
    const { rows } = await Database.pool.query(
      `
      SELECT
        COUNT (*) FILTER (WHERE manages = true) as adminCount,
        COUNT (*) FILTER (WHERE manages = false) as memberCount
      FROM HouseholdAssignment
      WHERE userId = $1
      `,
      [id],
    );
    return rows[0];
  },
  getUsage: async (id) => {
    const { rows } = await Database.pool.query(
      `
      WITH UserActivity AS (
        SELECT u."id" as userId, COUNT(h.id) as activityCount
        FROM "User" u
        LEFT JOIN History h ON u."id" = h.userId
        GROUP BY u."id"
      ),
      RankedActivity AS (
        SELECT
          userId,
          PERCENT_RANK() OVER (ORDER BY activityCount) * 100 as usagePercentile
        FROM UserActivity
      )
      SELECT ROUND(usagePercentile) as usageLevel
      FROM RankedActivity
      WHERE userId = $1
      `,
      [id],
    );

    return rows[0];
  },
};

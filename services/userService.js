const Database = require("../utils/Database");

module.exports = {
  getAllUsers: async () => {
    const { rows } = await Database.pool.query(
      `SELECT * FROM "User" ORDER BY "id" ASC`,
    );
    return rows;
  },

  createUser: async (surname, name) => {
    const { rows } = await Database.pool.query(
      `INSERT INTO "User" (surname, name) VALUES ($1, $2) RETURNING *`,
      [surname, name],
    );
    return rows[0];
  },

  getHousesToDelete: async (userId, client) => {
    const { rows } = await client.query(
      `SELECT h.* FROM Household h
       INNER JOIN HouseholdAssignment ha ON h.id = ha.householdId
       WHERE ha.manages = true 
       GROUP BY h.id 
       HAVING COUNT(ha.userId) = 1 
        AND MIN(ha.userId) = $1`,
      [userId],
    );
    return rows;
  },

  deleteUser: async (userId, client) => {
    const { rows } = await client.query(
      `DELETE FROM "User" WHERE "id" = $1 RETURNING *`,
      [userId],
    );
    return rows[0];
  },
};

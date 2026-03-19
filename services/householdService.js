const Database = require("../utils/Database");

module.exports = {
  async getHouseholdById(id) {
    const { rows } = await Database.pool.query(
      "SELECT * FROM Household WHERE id = $1",
      [id],
    );
    return rows[0];
  },
  async getHouseholdsByUserId(userId) {
    const { rows } = await Database.pool.query(
      `
      SELECT * FROM Household h
      LEFT JOIN HouseholdAssignment ha on h.id = ha.householdId
      WHERE ha.userId = $1
      ORDER BY h.id ASC
    `,
      [userId],
    );
    return rows;
  },
  async createHousehold(name, address, client) {
    const { rows } = await client.query(
      "INSERT INTO Household (name, address) VALUES ($1, $2) RETURNING *",
      [name, address],
    );
    return rows[0];
  },
  async updateHousehold(id, name, client) {
    const { rows } = await client.query(
      "UPDATE Household SET name = $1 WHERE id = $2 RETURNING *",
      [name, id],
    );
    return rows[0];
  },
  async deleteHousehold(id, client) {
    const { rows } = await client.query(
      "DELETE FROM Household WHERE id = $1 RETURNING *",
      [id],
    );
    return rows[0];
  },

  async getAssignment(householdId) {
    const { rows } = await Database.pool.query(
      `SELECT * FROM HouseholdAssignment
      LEFT JOIN "User" u on HouseholdAssignment.userId = u."id"
      WHERE householdId = $1
      `,
      [householdId],
    );
    return rows;
  },
  async addUserToHousehold(userId, householdId, manages, client) {
    const { rows } = await client.query(
      "INSERT INTO HouseholdAssignment (userId, householdId, manages) VALUES ($1, $2, $3) RETURNING *",
      [userId, householdId, manages],
    );
    return rows[0];
  },

  async removeUserFromHousehold(userId, householdId, client) {
    const { rows } = await client.query(
      "DELETE FROM HouseholdAssignment WHERE householdID = $1 AND userID = $2 RETURNING *",
      [householdId, userId],
    );
    return rows[0];
  },
  async updateAssignment(userId, householdId, manages, client) {
    const { rows } = await client.query(
      "UPDATE HouseholdAssignment SET manages = $1 WHERE userId = $2 AND householdId = $3 RETURNING *",
      [manages, userId, householdId],
    );
    return rows[0];
  },

  async getDeviceCount(householdId) {
    const { rows } = await Database.pool.query(
      `
      SELECT r.id, COUNT(d.id) as deviceCount
      FROM Room r
      LEFT JOIN Device d on r.id = d.RoomId
      WHERE r.HouseholdId = $1
      GROUP BY r.id
      `,
      [householdId],
    );

    return rows;
  },
};

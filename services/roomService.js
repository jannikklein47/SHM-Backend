const Database = require("../utils/Database");

module.exports = {
  getRoomById: async (roomId, client) => {
    const { rows } = await client.query(
      "SELECT * FROM Room WHERE id = $1 AND deleted = false",
      [roomId],
    );
    return rows[0];
  },
  getRoomsByHouseholdId: async (householdId) => {
    const { rows } = await Database.pool.query(
      "SELECT * FROM Room WHERE householdId = $1 AND deleted = false ORDER BY id ASC",
      [householdId],
    );
    return rows;
  },

  createRoom: async (name, householdId, roomTypeId, client) => {
    const { rows } = await client.query(
      "INSERT INTO Room (name, householdId, roomTypeId) VALUES ($1, $2, $3) RETURNING *",
      [name, householdId, roomTypeId],
    );
    return rows[0];
  },

  renameRoom: async (roomId, name, client) => {
    const { rows } = await client.query(
      "UPDATE Room SET name = $1 WHERE id = $2 RETURNING *",
      [name, roomId],
    );
    return rows[0];
  },

  deleteRoom: async (roomId, client) => {
    const { rows } = await client.query(
      "UPDATE Room SET deleted = true WHERE id = $1 RETURNING *",
      [roomId],
    );
    return rows[0];
  },
};

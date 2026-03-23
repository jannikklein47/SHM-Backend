const APIError = require("../utils/error");
const Database = require("../utils/Database");

module.exports = {
  entry: async (
    { message, sensorId, deviceId, roomId, householdId, userId },
    client,
  ) => {
    await client.query(
      "INSERT INTO History (description, sensorId, deviceId, roomId, householdId, userId) VALUES ($1, $2, $3, $4, $5, $6)",
      [message, sensorId, deviceId, roomId, householdId, userId],
    );
  },

  getHistory: async (householdId) => {
    const { rows } = await Database.pool.query(
      `
      SELECT
        h.*,
        u.name as userName,
        u.surname as userSurname,
        s.sensorTypeId,
        d.name as deviceName,
        r.name as roomName,
        hh.name as householdName
      FROM History h
      LEFT JOIN "User" u ON h.userId = u."id"
      LEFT JOIN Sensor s ON h.sensorId = s.id
      LEFT JOIN Device d ON h.deviceId = d.id
      LEFT JOIN Room r ON h.roomId = r.id
      LEFT JOIN Household hh ON h.householdId = hh.id
      WHERE h.householdId = $1
      ORDER BY h.timestamp DESC
    `,
      [householdId],
    );
    return rows;
  },

  getLatest: async (householdId) => {
    const { rows } = await Database.pool.query(
      `
      SELECT
        h.*,
        u.name as userName,‚
        u.surname as userSurname,
        s.sensorTypeId,
        d.name as deviceName,
        r.name as roomName,
        hh.name as householdName
      FROM History h
      LEFT JOIN "User" u ON h.userId = u."id"
      LEFT JOIN Sensor s ON h.sensorId = s.id
      LEFT JOIN Device d ON h.deviceId = d.id
      LEFT JOIN Room r ON h.roomId = r.id
      LEFT JOIN Household hh ON h.householdId = hh.id
      WHERE h.householdId = $1
      ORDER BY h.timestamp DESC
      LIMIT 1
    `,
      [householdId],
    );
    return rows;
  },
};

const Database = require("../utils/Database");

module.exports = {
  getDeviceById: async (id) => {
    const { rows } = await Database.pool.query(
      `SELECT d.*, dt.name as deviceTypeName, i.name as interface, dt.icon FROM Device d
      LEFT JOIN DeviceType dt on d.deviceTypeId = dt.id
      LEFT JOIN Interface i on d.interfaceId = i.id
      WHERE d.id = $1 AND d.deleted = false`,
      [id],
    );
    return rows[0];
  },
  getDevicesByHouseholdId: async (householdId) => {
    const { rows } = await Database.pool.query(
      `SELECT d.*, i.name as interfaceName, s.stateId as latestStateId, s.stateName as latestStateName, s.operationTypeName as latestOperationType, dt.icon as icon, dt.id as deviceTypeId FROM Device d 
      LEFT JOIN Room r ON d.roomId = r.id
      LEFT JOIN Interface i ON d.interfaceId = i.id
      LEFT JOIN DeviceType dt ON d.deviceTypeId = dt.id
      LEFT JOIN (
        SELECT DISTINCT ON (o.deviceId) o.deviceId, s.id as stateId, s.name as stateName, ot.name as operationTypeName
        FROM State s
        INNER JOIN Operation o ON o.stateId = s.id
        INNER JOIN OperationType ot ON o.operationTypeId = ot.id
        ORDER BY o.deviceId, timestamp DESC
      ) s on s.deviceId = d.id
      WHERE r.HouseholdId = $1 
        AND d.deleted = false ORDER BY d.id ASC`,
      [householdId],
    );
    return rows;
  },

  getDeviceContext: async (deviceId, client) => {
    const { rows } = await client.query(
      "SELECT d.id deviceId, r.id as roomId, r.householdId FROM Device d LEFT JOIN Room r on d.roomId = r.id WHERE d.id = $1",
      [deviceId],
    );
    return rows[0];
  },

  createDevice: async (
    name,
    deviceTypeId,
    interfaceId,
    getRoomById,
    client,
  ) => {
    const { rows } = await client.query(
      "INSERT INTO Device (name, deviceTypeId, interfaceId, roomId) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, deviceTypeId, interfaceId, getRoomById],
    );
    return rows[0];
  },

  renameDevice: async (id, name, client) => {
    const { rows } = await client.query(
      "UPDATE Device SET name = $1 WHERE id = $2 RETURNING *",
      [name, id],
    );
    return rows[0];
  },

  deleteDevice: async (id, client) => {
    const { rows } = await client.query(
      "UPDATE Device SET deleted = true WHERE id = $1 RETURNING *",
      [id],
    );
    return rows[0];
  },

  getAverageReading: async (id) => {
    const { rows } = await Database.pool.query(
      `
      SELECT s.id, AVG(m.value) as averageReading
      FROM Sensor s
      INNER JOIN Measurement m ON s.id = m.sensorId
      WHERE s.deviceId = $1
      GROUP BY s.id
      `,
      [id],
    );
    return rows;
  },

  getAlarmStats: async (id) => {
    const { rows } = await Database.pool.query(
      `
      SELECT * FROM vAlarmStatistics vas
      LEFT JOIN Sensor s ON vas.sensorId = s.id
      WHERE s.deviceId = $1
      `,
      [id],
    );
    return rows;
  },

  getAverageSensorDiff: async (id) => {
    const { rows } = await Database.pool.query(
      `
      SELECT s.id, AVG(exceededPercent) as average
      FROM vAlarmStatistics vas
      INNER JOIN Sensor s ON vas.sensorId = s.id
      WHERE s.deviceId = $1
      GROUP BY s.id
      `,
      [id],
    );
    return rows;
  },
};

const Database = require("../utils/Database");

module.exports = {
  getSensorsByDeviceId: async (deviceId, client) => {
    const { rows } = await client.query(
      "SELECT * FROM Sensor WHERE deviceId = $1 ORDER BY id ASC",
      [deviceId],
    );
    return rows;
  },
  createSensor: async (sensorTypeId, deviceId, threshold, client) => {
    const { rows } = await client.query(
      "INSERT INTO Sensor (sensorTypeId, createdAt, deviceId, threshold) VALUES ($1, NOW(), $2, $3) RETURNING *",
      [sensorTypeId, deviceId, threshold],
    );
    return rows[0];
  },

  updateSensor: async (sensorId, threshold, client) => {
    const { rows } = await client.query(
      "UPDATE Sensor SET threshold = $1 WHERE id = $2 RETURNING *",
      [threshold, sensorId],
    );
    return rows[0];
  },

  deleteSensor: async (sensorId, client) => {
    const { rows } = await client.query(
      "DELETE FROM Sensor WHERE id = $1 RETURNING *",
      [sensorId],
    );
    return rows[0];
  },
};

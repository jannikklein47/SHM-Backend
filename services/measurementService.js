const Database = require("../utils/Database");

module.exports = {
  getMeasurementsOfSensor: async (deviceId) => {
    const { rows } = await Database.pool.query(
      "SELECT * FROM Measurement WHERE sensorId = $1 ORDER BY timestamp DESC",
      [deviceId],
    );
    return rows;
  },
  createMeasurement: async (value, threshold, sensorId, client) => {
    const { rows } = await client.query(
      "INSERT INTO Measurement (value, threshold, sensorId, timestamp) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [value, threshold, sensorId],
    );
    if (value >= threshold) {
      await client.query("INSERT INTO Alarm (measurementId) VALUES ($1)", [
        rows[0].id,
      ]);
    }
    return rows[0];
  },
};

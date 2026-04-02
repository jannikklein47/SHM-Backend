const Database = require("../utils/Database");

module.exports = {
  getMeasurementsOfSensor: async (deviceId) => {
    const { rows } = await Database.pool.query(
      "SELECT * FROM Measurement WHERE sensorId = $1 ORDER BY timestamp DESC",
      [deviceId],
    );
    return rows;
  },
  createMeasurement: async (value, sensorId, client) => {
    const { rows } = await client.query(
      "INSERT INTO Measurement (value, sensorId, timestamp) VALUES ($1, $2, NOW()) RETURNING *",
      [value, sensorId],
    );
    const { rows: sensorRows } = await client.query(
      "SELECT threshold FROM Sensor WHERE id = $1",
      [sensorId],
    );
    if (value >= sensorRows[0].threshold) {
      await client.query("INSERT INTO Alarm (measurementId) VALUES ($1)", [
        rows[0].id,
      ]);
    }
    return rows[0];
  },
};

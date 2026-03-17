const Database = require("../utils/Database");

module.exports = {
  getOperationsByDeviceId: async (deviceId) => {
    const { rows } = await Database.pool.query(
      "SELECT * FROM Operation o LEFT JOIN State s on o.stateId = s.id Where o.deviceId = $1 ORDER BY o.timestamp DESC",
      [deviceId],
    );
    return rows;
  },

  createOperation: async (deviceId, typeId, stateId, client) => {
    const { rows } = await client.query(
      "INSERT INTO Operation (deviceId, operationTypeId, stateId) VALUES ($1, $2, $3) RETURNING *",
      [deviceId, typeId, stateId],
    );
    return rows[0];
  },
};

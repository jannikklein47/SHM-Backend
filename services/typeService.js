const Database = require("../utils/Database");

module.exports = {
  getTypes: async (deviceTypeId) => {
    const roomType = await Database.pool.query(
      "SELECT * FROM RoomType ORDER BY id ASC",
    );
    const deviceType = await Database.pool.query(
      "SELECT * FROM DeviceType ORDER BY id ASC",
    );
    const sensorType = await Database.pool.query(
      "SELECT * FROM SensorType ORDER BY id ASC",
    );

    let operationType;

    if (deviceTypeId) {
      operationType = await Database.pool.query(
        `
        SELECT DISTINCT(ot.id), ot.* FROM OperationType ot
        LEFT JOIN DeviceTypeOperations dto on ot.id = dto.operationTypeId
        LEFT JOIN State s ON s.operationTypeId = ot.id
        WHERE dto.deviceTypeId = $1
        `,
        [deviceTypeId],
      );
    } else {
      operationType = await Database.pool.query(
        "SELECT * FROM OperationType ORDER BY id ASC",
      );
    }

    const state = await Database.pool.query(
      `
      SELECT s.* FROM State s
      ORDER BY s.id ASC
      `,
    );
    const interface = await Database.pool.query(
      "SELECT * FROM Interface ORDER BY id ASC",
    );
    return {
      roomType: roomType.rows,
      deviceType: deviceType.rows,
      sensorType: sensorType.rows,
      operationType: operationType.rows,
      state: state.rows,
      interface: interface.rows,
    };
  },
};

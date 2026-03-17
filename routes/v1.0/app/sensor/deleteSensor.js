const express = require("express");
const router = express.Router();
const DeviceService = require("../../../../services/deviceService");
const SensorService = require("../../../../services/sensorService");
const RoomService = require("../../../../services/roomService");
const OperationService = require("../../../../services/operationService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.delete("/:id", async (req, res, next) => {
  try {
    let sensor;
    await Database.transaction(async (client) => {
      sensor = await SensorService.deleteSensor(req.params.id, client);
      const deviceContext = await DeviceService.getDeviceContext(
        sensor.deviceId,
        client,
      );
      await HistoryService.entry(
        {
          message: "Sensor " + sensor.id + " deleted",
          sensorId: sensor.id,
          deviceId: deviceContext.deviceid,
          roomId: deviceContext.roomid,
          userId: req.userId,
          householdId: deviceContext.householdid,
        },
        client,
      );
    });
    res.json(sensor);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

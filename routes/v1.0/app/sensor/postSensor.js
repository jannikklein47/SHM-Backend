const express = require("express");
const router = express.Router();
const DeviceService = require("../../../../services/deviceService");
const SensorService = require("../../../../services/sensorService");
const RoomService = require("../../../../services/roomService");
const OperationService = require("../../../../services/operationService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.post("/", async (req, res, next) => {
  try {
    const { deviceId, sensorTypeId } = req.body;
    let newSensor;
    await Database.transaction(async (client) => {
      newSensor = await SensorService.createSensor(
        sensorTypeId,
        deviceId,
        client,
      );
      const deviceContext = await DeviceService.getDeviceContext(
        deviceId,
        client,
      );
      await HistoryService.entry(
        {
          message: "Sensor " + newSensor.id + " created",
          sensorId: newSensor.id,
          deviceId: deviceContext.deviceid,
          roomId: deviceContext.roomid,
          userId: req.userId,
          householdId: deviceContext.householdid,
        },
        client,
      );
    });
    res.json(newSensor);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

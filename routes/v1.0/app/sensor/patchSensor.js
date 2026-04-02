const express = require("express");
const router = express.Router();
const DeviceService = require("../../../../services/deviceService");
const SensorService = require("../../../../services/sensorService");
const RoomService = require("../../../../services/roomService");
const OperationService = require("../../../../services/operationService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.patch("/", async (req, res, next) => {
  try {
    const { threshold, sensorId } = req.body;
    let updatedSensor;
    await Database.transaction(async (client) => {
      updatedSensor = await SensorService.updateSensor(
        sensorId,
        threshold,
        client,
      );
      const deviceContext = await DeviceService.getDeviceContext(
        deviceId,
        client,
      );
      await HistoryService.entry(
        {
          message: "Changed Threshold of Sensor " + updatedSensor.id,
          sensorId: updatedSensor.id,
          deviceId: deviceContext.deviceid,
          roomId: deviceContext.roomid,
          userId: req.userId,
          householdId: deviceContext.householdid,
        },
        client,
      );
    });
    res.json(updatedSensor);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

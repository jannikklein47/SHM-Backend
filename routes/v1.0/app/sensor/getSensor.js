const express = require("express");
const router = express.Router();
const DeviceService = require("../../../../services/deviceService");
const SensorService = require("../../../../services/sensorService");
const RoomService = require("../../../../services/roomService");
const OperationService = require("../../../../services/operationService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.get("/:deviceId", async (req, res, next) => {
  try {
    const sensors = await SensorService.getSensorsByDeviceId(
      req.params.deviceId,
      Database.pool,
    );
    res.json(sensors);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

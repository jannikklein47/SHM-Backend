const express = require("express");
const router = express.Router();
const DeviceService = require("../../../../services/deviceService");
const SensorService = require("../../../../services/sensorService");
const RoomService = require("../../../../services/roomService");
const OperationService = require("../../../../services/operationService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");
const MeasurementService = require("../../../../services/measurementService");
const TypeService = require("../../../../services/typeService");

router.get("/", async (req, res, next) => {
  try {
    const types = await TypeService.getTypes(req.query.deviceTypeId);
    res.json(types);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

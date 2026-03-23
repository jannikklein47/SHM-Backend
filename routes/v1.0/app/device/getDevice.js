const express = require("express");
const router = express.Router();
const DeviceService = require("../../../../services/deviceService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.get("/averageSensorDiff/:id", async (req, res, next) => {
  try {
    const averageDiff = await DeviceService.getAverageSensorDiff(req.params.id);
    res.json(averageDiff);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

router.get("/alarmStats/:id", async (req, res, next) => {
  try {
    const stats = await DeviceService.getAlarmStats(req.params.id);
    res.json(stats);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

router.get("/averageReading/:id", async (req, res, next) => {
  try {
    const avgReading = await DeviceService.getAverageReading(req.params.id);
    res.json(avgReading);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

router.get("/household/:id", async (req, res, next) => {
  try {
    const devices = await DeviceService.getDevicesByHouseholdId(req.params.id);
    res.json(devices);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const device = await DeviceService.getDeviceById(req.params.id);
    res.json(device);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

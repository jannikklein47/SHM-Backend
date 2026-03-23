const express = require("express");
const router = express.Router();
const DeviceService = require("../../../../services/deviceService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.get("/latest/:id", async (req, res, next) => {
  try {
    const latest = await HistoryService.getLatest(req.params.id);
    res.json(latest);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const history = await HistoryService.getHistory(req.params.id);
    res.json(history);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

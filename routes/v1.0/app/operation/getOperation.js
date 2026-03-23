const express = require("express");
const router = express.Router();
const DeviceService = require("../../../../services/deviceService");
const OperationService = require("../../../../services/operationService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.get("/:deviceId", async (req, res, next) => {
  try {
    const operations = await OperationService.getOperationsByDeviceId(
      req.params.deviceId,
    );
    res.json(operations);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

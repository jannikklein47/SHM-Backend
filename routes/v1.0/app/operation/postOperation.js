const express = require("express");
const router = express.Router();
const DeviceService = require("../../../../services/deviceService");
const OperationService = require("../../../../services/operationService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.post("/", async (req, res, next) => {
  try {
    const { deviceId, typeId, stateId } = req.body;

    if (!deviceId || !typeId || !stateId) {
      return next(APIError.errorValidation("Missing required fields"));
    }

    let newOperation;
    await Database.transaction(async (client) => {
      newOperation = await OperationService.createOperation(
        deviceId,
        typeId,
        stateId,
        client,
      );

      const deviceContext = await DeviceService.getDeviceContext(
        deviceId,
        client,
      );

      await HistoryService.entry(
        {
          message: "Operation commited",
          deviceId,
          roomid: deviceContext.roomid,
          householdId: deviceContext.householdid,
          userId: req.userId,
        },
        client,
      );
    });

    res.json(newOperation);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const DeviceService = require("../../../../services/deviceService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.delete("/:id", async (req, res, next) => {
  try {
    let deleted;
    await Database.transaction(async (client) => {
      deleted = await DeviceService.deleteDevice(req.params.id, client);
      await HistoryService.entry(
        {
          message: "Device " + deleted.id + " deleted",
          deviceId: deleted.id,
          roomId: deleted.roomid,
          userId: req.userId,
          householdId: deleted.householdid,
        },
        client,
      );
    });
    res.json(deleted);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

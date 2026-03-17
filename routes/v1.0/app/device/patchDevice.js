const express = require("express");
const router = express.Router();
const DeviceService = require("../../../../services/deviceService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");
const RoomService = require("../../../../services/roomService");
const householdService = require("../../../../services/householdService");

router.patch("/:id", async (req, res, next) => {
  try {
    const { name } = req.body;
    let updated;
    await Database.transaction(async (client) => {
      const updated = await DeviceService.renameDevice(
        req.params.id,
        name,
        client,
      );
      const room = await RoomService.getRoomById(updated.roomid, client);

      await HistoryService.entry(
        {
          message: "Device " + updated.id + " Renamed",
          deviceId: updated.id,
          userId: req.userId,
          householdId: room.householdid,
        },
        client,
      );
    });
    res.json(updated);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

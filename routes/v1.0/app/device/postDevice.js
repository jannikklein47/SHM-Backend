const express = require("express");
const router = express.Router();
const DeviceService = require("../../../../services/deviceService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");
const RoomService = require("../../../../services/roomService");

router.post("/:roomId", async (req, res, next) => {
  try {
    const { name, deviceTypeId, interfaceId } = req.body;
    let newDevice;
    await Database.transaction(async (client) => {
      newDevice = await DeviceService.createDevice(
        name,
        deviceTypeId,
        interfaceId,
        req.params.roomId,
        client,
      );

      const room = await RoomService.getRoomById(req.params.roomId, client);

      await HistoryService.entry(
        {
          message: "Device " + newDevice.id + " created",
          deviceId: newDevice.id,
          roomId: req.params.roomId,
          userId: req.userId,
          householdId: room.householdid,
        },
        client,
      );
    });
    res.json(newDevice);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

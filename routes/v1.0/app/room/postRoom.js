const express = require("express");
const router = express.Router();
const RoomService = require("../../../../services/roomService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.post("/:householdId", async (req, res, next) => {
  try {
    const { name, roomTypeId } = req.body;
    let newRoom;
    await Database.transaction(async (client) => {
      newRoom = await RoomService.createRoom(
        name,
        req.params.householdId,
        roomTypeId,
        client,
      );
      await HistoryService.entry(
        {
          message: "Room " + newRoom.id + " created",
          userId: req.userId,
          roomId: newRoom.id,
          householdId: req.params.householdId,
        },
        client,
      );
    });
    res.json(newRoom);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

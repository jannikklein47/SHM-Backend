const express = require("express");
const router = express.Router();
const RoomService = require("../../../../services/roomService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.delete("/:id", async (req, res, next) => {
  try {
    let deleted;

    await Database.transaction(async (client) => {
      deleted = await RoomService.deleteRoom(req.params.id, Database.pool);
      await HistoryService.entry(
        {
          message: "Room " + deleted.id + " deleted",
          roomId: deleted.id,
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

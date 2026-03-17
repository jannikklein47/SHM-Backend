const express = require("express");
const router = express.Router();
const RoomService = require("../../../../services/roomService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.patch("/:id", async (req, res, next) => {
  try {
    const { name } = req.body;
    let renamed;
    await Database.transaction(async (client) => {
      renamed = await RoomService.renameRoom(req.params.id, name, client);
      console.log(renamed);
      await HistoryService.entry(
        {
          message: "Room " + name + " Renamed",
          roomId: renamed.id,
          userId: req.userId,
          householdId: renamed.householdid,
        },
        client,
      );
    });
    res.json(renamed);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

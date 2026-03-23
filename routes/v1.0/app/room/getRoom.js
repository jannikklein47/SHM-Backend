const express = require("express");
const router = express.Router();
const RoomService = require("../../../../services/roomService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.get("/:householdId", async (req, res, next) => {
  try {
    const rooms = await RoomService.getRoomsByHouseholdId(
      req.params.householdId,
    );
    res.json(rooms);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

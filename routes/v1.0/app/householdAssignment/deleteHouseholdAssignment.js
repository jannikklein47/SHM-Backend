const express = require("express");
const router = express.Router();
const HouseholdService = require("../../../../services/householdService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.delete("/:id", async (req, res, next) => {
  try {
    const householdId = req.params.id;
    const { userId, deleteHouse } = req.query;

    await Database.transaction(async (client) => {
      if (deleteHouse === "true") {
        await HouseholdService.deleteHousehold(householdId, client);
        return res.json({ message: "Household deleted" });
      }

      const deleted = await HouseholdService.removeUserFromHousehold(
        userId,
        householdId,
        client,
      );
      await HistoryService.entry(
        {
          message: "Removed User " + userId + " from Household",
          userId: req.userId,
          householdId,
        },
        client,
      );
      res.json(deleted);
    });
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

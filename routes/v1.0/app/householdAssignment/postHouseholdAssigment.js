const express = require("express");
const router = express.Router();
const HouseholdService = require("../../../../services/householdService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.post("/:id", async (req, res, next) => {
  try {
    let assignment;
    const userId = req.body.userId;
    await Database.transaction(async (client) => {
      assignment = await HouseholdService.addUserToHousehold(
        userId,
        req.params.id,
        false,
        client,
      );
      await HistoryService.entry(
        {
          message: "Added Member",
          userId,
          householdId: req.params.id,
        },
        client,
      );
    });

    res.json(assignment);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

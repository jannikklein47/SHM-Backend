const express = require("express");
const router = express.Router();
const HouseholdService = require("../../../../services/householdService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.patch("/:id", async (req, res, next) => {
  try {
    let assignment;
    const { userId, manages } = req.body;
    await Database.transaction(async (client) => {
      assignment = await HouseholdService.updateAssignment(
        userId,
        req.params.id,
        manages,
        client,
      );
      await HistoryService.entry(
        {
          message: "User got assigned " + (manages ? "Admin" : "Member"),
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

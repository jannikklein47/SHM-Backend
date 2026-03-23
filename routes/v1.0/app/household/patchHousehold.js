const express = require("express");
const router = express.Router();
const HouseholdService = require("../../../../services/householdService");
const APIError = require("../../../../utils/error");
const HistoryService = require("../../../../services/historyService");
const Database = require("../../../../utils/Database");

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    let updatedHousehold;

    await Database.transaction(async (client) => {
      updatedHousehold = await HouseholdService.updateHousehold(
        id,
        name,
        client,
      );
      await HistoryService.entry(
        { message: "Renamed Household", householdId: id, userId: req.userId },
        client,
      );
    });

    res.json(updatedHousehold);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

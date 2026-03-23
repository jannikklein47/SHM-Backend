const express = require("express");
const router = express.Router();
const HouseholdService = require("../../../../services/householdService");
const APIError = require("../../../../utils/error");
const HistoryService = require("../../../../services/historyService");
const Database = require("../../../../utils/Database");

router.post("/", async (req, res, next) => {
  try {
    const { name, address } = req.body;

    let newHousehold, assignment;

    await Database.transaction(async (client) => {
      newHousehold = await HouseholdService.createHousehold(
        name,
        address,
        client,
      );
      console.log(newHousehold, req.userId);
      assignment = await HouseholdService.addUserToHousehold(
        req.userId,
        newHousehold.id,
        true,
        client,
      );
      await HistoryService.entry(
        {
          message: "Household created",
          householdId: newHousehold.id,
          userId: req.userId,
        },
        client,
      );
      await HistoryService.entry(
        {
          message: "Admin assigned",
          householdId: newHousehold.id,
          userId: req.userId,
        },
        client,
      );
    });

    res.json({ newHousehold, assignment });
  } catch (error) {
    console.log(error);
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

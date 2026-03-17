const express = require("express");
const router = express.Router();
const HouseholdService = require("../../../../services/householdService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");

router.delete("/:id", async (req, res, next) => {
  try {
    const householdId = req.params.id;

    const deleted = await HouseholdService.deleteHousehold(
      householdId,
      Database.pool,
    );

    res.json(deleted);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

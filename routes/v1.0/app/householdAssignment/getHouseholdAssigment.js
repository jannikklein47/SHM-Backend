const express = require("express");
const router = express.Router();
const HouseholdService = require("../../../../services/householdService");
const APIError = require("../../../../utils/error");

router.get("/:id", async (req, res, next) => {
  try {
    const assignment = await HouseholdService.getAssignment(req.params.id);
    res.json(assignment);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

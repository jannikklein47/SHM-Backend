const express = require("express");
const router = express.Router();
const HouseholdService = require("../../../../services/householdService");
const APIError = require("../../../../utils/error");

router.get("/deviceCount/:id", async (req, res, next) => {
  try {
    const count = await HouseholdService.getDeviceCount(req.params.id);
    res.json(count);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const userHouseholds = await HouseholdService.getHouseholdsByUserId(
      req.params.userId,
    );
    res.json(userHouseholds);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

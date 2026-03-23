const express = require("express");
const router = express.Router();
const DeviceService = require("../../../../services/deviceService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");
const ProfileService = require("../../../../services/profileService");

router.get("/:id", async (req, res, next) => {
  try {
    const interactions = await ProfileService.getInteractions(req.params.id);
    const householdInfo = await ProfileService.getHouseholdInfo(req.params.id);
    const usage = await ProfileService.getUsage(req.params.id);
    res.json({
      interactionCount: interactions,
      adminCount: householdInfo.admincount,
      memberCount: householdInfo.membercount,
      usageLevel: usage.usagelevel,
    });
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

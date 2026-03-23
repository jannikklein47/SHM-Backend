const express = require("express");
const router = express.Router();
const DeviceService = require("../../../../services/deviceService");
const APIError = require("../../../../utils/error");
const Database = require("../../../../utils/Database");
const HistoryService = require("../../../../services/historyService");
const HouseholdService = require("../../../../services/householdService");
const UserService = require("../../../../services/userService");

router.get("/delete", async (req, res, next) => {
  try {
    const housesToDelete = await UserService.getHousesToDelete(
      req.userId,
      Database.pool,
    );
    res.json(housesToDelete);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

router.delete("/delete", async (req, res, next) => {
  try {
    let deletedUser;
    await Database.transaction(async (client) => {
      const housesToDelete = await UserService.getHousesToDelete(
        req.userId,
        client,
      );
      for (const house of housesToDelete) {
        await HouseholdService.deleteHousehold(house.id, client);
      }
      deletedUser = await UserService.deleteUser(req.userId, client);
    });
    res.json(deletedUser);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const UserService = require("../../../../services/userService");
const APIError = require("../../../../utils/error");

router.get("/", async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const UserService = require("../../../../services/userService");
const APIError = require("../../../../utils/error");

router.post("/", async (req, res, next) => {
  try {
    const { surname, name } = req.body;
    const newUser = await UserService.createUser(surname, name);
    res.json(newUser);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const AuthService = require("../../../services/authService");
const APIError = require("../../../utils/error");

router.post("/login", async (req, res, next) => {
  try {
    const token = await AuthService.login(req, res, next);
    return res.status(200).json(token);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const AuthService = require("../../../services/authService");
const APIError = require("../../../utils/error");

router.post("/", async (req, res, next) => {
  try {
    const result = await AuthService.register(req, res, next);
    return res.status(201).json(result);
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    } else return next(APIError.errorUnknown(error));
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Logger = require("../utils/logger");
const APIError = require("../utils/error");
const v1_0 = require("./v1.0/v1Router");

const error404 = (req, res, next) => {
  next(APIError.errorNotFound());
};

const errorHandler = (error, req, res, next) => {
  Logger.error(
    `${error.message}: responding with ${
      error.statusCode || 500
    } / success => ${error.success || false}`,
  );
  if (process.env.NODE_ENV !== "development") {
    delete error.stack;
  }
  res.status(error.statusCode || 500).send(error);
};

module.exports = (app) => {
  router.use("/api/v1", v1_0);
  router.use(error404);
  router.use(errorHandler);
  app.use(router);
};

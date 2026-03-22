const express = require("express");
const appRouter = express.Router();

const login = require("./login");

appRouter.use("/", login);

module.exports = appRouter;

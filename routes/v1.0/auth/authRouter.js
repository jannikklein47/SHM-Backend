const express = require("express");
const appRouter = express.Router();

const login = require("./login");
const register = require("./register");

appRouter.use("/login", login);
appRouter.use("/register", register);

module.exports = appRouter;

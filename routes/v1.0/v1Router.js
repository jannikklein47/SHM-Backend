const express = require("express");

const v1Router = express.Router();

const appRouter = require("./app/appRouter");

const authRouter = require("./auth/authRouter");

v1Router.use("/auth", authRouter);

v1Router.use("/app", appRouter);

module.exports = v1Router;

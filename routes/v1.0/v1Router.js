const express = require("express");

const v1Router = express.Router();

const appRouter = require("./app/appRouter");

// Protected routes
v1Router.use("/app", /*verifyToken(),*/ appRouter);

module.exports = v1Router;

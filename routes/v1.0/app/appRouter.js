const express = require("express");
const appRouter = express.Router();
const verifyUser = require("../../../utils/verifyUser.js");

const getDevice = require("./device/getDevice");
const postDevice = require("./device/postDevice");
const deleteDevice = require("./device/deleteDevice");
const patchDevice = require("./device/patchDevice");

const getHistory = require("./history/getHistory");

const getHousehold = require("./household/getHousehold");
const patchHousehold = require("./household/patchHousehold");
const postHousehold = require("./household/postHousehold");
const deleteHousehold = require("./household/deleteHousehold");

const getHouseholdAssignment = require("./householdAssignment/getHouseholdAssigment");
const postHouseholdAssignment = require("./householdAssignment/postHouseholdAssigment");
const patchHouseholdAssignment = require("./householdAssignment/patchHouseholdAssignment");
const deleteHouseholdAssignment = require("./householdAssignment/deleteHouseholdAssignment");

const getMeasurement = require("./measurement/getMeasurement");
const postMeasurement = require("./measurement/postMeasurement");

const getOperation = require("./operation/getOperation");
const postOperation = require("./operation/postOperation");

const getProfile = require("./profile/getProfile");

const getRoom = require("./room/getRoom");
const postRoom = require("./room/postRoom");
const patchRoom = require("./room/patchRoom");
const deleteRoom = require("./room/deleteRoom");

const getSensor = require("./sensor/getSensor");
const postSensor = require("./sensor/postSensor");
const deleteSensor = require("./sensor/deleteSensor");

const getType = require("./type/getType");

const getUser = require("./user/getUser");
const postUser = require("./user/postUser");
const deleteUser = require("./user/deleteUser");

appRouter.use(
  "/device",
  verifyUser,
  getDevice,
  postDevice,
  deleteDevice,
  patchDevice,
);
appRouter.use("/history", verifyUser, getHistory);

appRouter.use(
  "/household",
  verifyUser,
  getHousehold,
  patchHousehold,
  postHousehold,
  deleteHousehold,
);
appRouter.use(
  "/householdAssignment",
  verifyUser,
  getHouseholdAssignment,
  postHouseholdAssignment,
  patchHouseholdAssignment,
  deleteHouseholdAssignment,
);

appRouter.use("/measurement", verifyUser, getMeasurement, postMeasurement);

appRouter.use("/operation", verifyUser, getOperation, postOperation);

appRouter.use("/profile", verifyUser, getProfile);

appRouter.use("/room", verifyUser, getRoom, postRoom, patchRoom, deleteRoom);

appRouter.use("/sensor", verifyUser, getSensor, postSensor, deleteSensor);

appRouter.use("/type", verifyUser, getType);

appRouter.use("/user", getUser, postUser, verifyUser, deleteUser);

module.exports = appRouter;

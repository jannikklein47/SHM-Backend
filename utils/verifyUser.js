const APIError = require("./error");

module.exports = (req, res, next) => {
  req.userId = req.headers["x-user-id"];
  if (!req.userId) next(APIError.errorUnauthorized());
  next();
};

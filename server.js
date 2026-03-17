const express = require("express");
const cors = require("cors");
const Logger = require("./utils/logger");
const morganMiddleware = require("./utils/morganMiddleware");
const app = express();

app.use(express.json());
app.use(
  cors({
    methods: ["GET", "POST", "OPTIONS", "PATCH", "DELETE"],
    origin: "*",
  }),
);

app.use(morganMiddleware);

require("./routes")(app);

app.listen(3000, () => Logger.info("Server running on port 3000"));

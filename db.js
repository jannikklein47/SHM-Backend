const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "WAB_Test",
  password: "postgres",
  port: 5432,
});

module.exports = pool;

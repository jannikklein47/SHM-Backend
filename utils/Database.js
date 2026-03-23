const { Pool } = require("pg");
const APIError = require("./error");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "WAB_Test",
  password: "postgres",
  port: 5432,
});

module.exports = {
  pool,
  transaction: async (callback) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw APIError.errorDatabase(error);
    } finally {
      client.release();
    }
  },
};

import fs from "fs";
import path from "path";
import pool from "./db.js";

async function runMigrations() {
  const migrationsDir = "./migrations";

  // 1. Get all .sql files
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"));

  // 2. Sort files by version (0.0, 0.1, 0.1.6, etc.)
  files.sort((a, b) => {
    const parse = (filename) =>
      filename.replace(".sql", "").split(".").map(Number);
    const partsA = parse(a);
    const partsB = parse(b);

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const numA = partsA[i] || 0;
      const numB = partsB[i] || 0;
      if (numA !== numB) return numA - numB;
    }
    return 0;
  });

  console.log(`Found ${files.length} migrations. Starting execution...`);

  // 3. Execute migrations sequentially
  const client = await pool.connect();

  try {
    for (const file of files) {
      console.log(`Running: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      // Use a transaction for each file so it fails safely
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");

      console.log(`Successfully applied ${file}`);
    }
    console.log("All migrations applied successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(`Migration failed at ${files[0]}:`, err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();

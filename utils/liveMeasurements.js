const Database = require("./Database");
const Logger = require("./logger");
const pool = Database.pool;

async function generateLiveTick() {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO Measurement (sensorId, value, timestamp)
      WITH CurrentTime AS (
        SELECT 
          s.id as sensor_id,
          st.name as sensor_type,
          CURRENT_TIMESTAMP as ts
        FROM Sensor s
        JOIN SensorType st ON s.sensorTypeId = st.id
        ORDER BY random()
        LIMIT 1
      ),
      CalculatedWaves AS (
        SELECT 
          *,
          extract(epoch from ts) as e,
          -- 24h, 7d, 3h, and 4w waves
          sin(extract(epoch from ts) * 2 * pi() / 86400 - (15 * pi() / 12)) as daily_wave,
          sin(extract(epoch from ts) * 2 * pi() / 604800) as weekly_trend,
          sin(extract(epoch from ts) * 2 * pi() / 10800) as local_fluctuation,
          sin(extract(epoch from ts) * 2 * pi() / 2419200) as seasonal_wave
        FROM CurrentTime
      )
      SELECT 
        sensor_id,
        CASE 
          WHEN sensor_type = 'Temperature' THEN 
            ROUND(CAST(20.0 + (4.0 * daily_wave) + (2.0 * weekly_trend) + (0.5 * local_fluctuation) - (4.0 * seasonal_wave) + (random() * 0.2) AS numeric), 2)
          WHEN sensor_type = 'Humidity' THEN 
            ROUND(CAST(60.0 - (4.0 * daily_wave) + (5.0 * weekly_trend) + (2.0 * local_fluctuation) + (10 * seasonal_wave) + (random() * 0.2) AS numeric), 2)
          WHEN sensor_type = 'Motion' THEN 
            CASE 
              WHEN extract(hour from ts) BETWEEN 8 AND 18 
              THEN (CASE WHEN random() > 0.7 THEN 1 ELSE 0 END) 
              ELSE (CASE WHEN random() > 0.95 THEN 1 ELSE 0 END)
            END
          ELSE ROUND(CAST(50.0 + (5.0 * daily_wave) + (random() * 2.0) AS numeric), 2)
        END as value,
        ts as timestamp
      FROM CalculatedWaves
      RETURNING *;
    `;

    const inserted = await client.query(query);
    const sensor = await client.query("SELECT * FROM Sensor WHERE id = $1", [
      inserted.rows[0].sensorid,
    ]);
    if (
      parseFloat(inserted.rows[0].value) >= parseFloat(sensor.rows[0].threshold)
    ) {
      await client.query("INSERT INTO Alarm (measurementId) VALUES ($1)", [
        inserted.rows[0].id,
      ]);
    }
  } catch (err) {
    console.error("Error generating mock data:", err);
  } finally {
    client.release();
  }
}

function scheduleNextTick() {
  Logger.info("Scheduling next live tick");
  const randomJitter = Math.floor(Math.random() * 1000);
  setTimeout(async () => {
    await generateLiveTick();
    scheduleNextTick(); // Recursive call for the next one
  }, randomJitter);
}

module.exports = scheduleNextTick;

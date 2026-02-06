const express = require("express");
const cors = require("cors");
const pool = require("./db");
const app = express();

app.use(express.json());
app.use(
  cors({
    methods: ["GET", "POST", "OPTIONS", "PATCH", "DELETE"],
    origin: "*",
  }),
);

async function log(
  message,
  sensor_id,
  geraet_id,
  raum_id,
  haushalt_id,
  nutzer_id,
) {
  try {
    await pool.query(
      "INSERT INTO Verlauf (beschreibung, sensor_id, geraet_id, raum_id, haushalt_id, nutzer_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [message, sensor_id, geraet_id, raum_id, haushalt_id, nutzer_id],
    );
  } catch (error) {
    console.error(error);
  }
}

app.get("/nutzer", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Nutzer ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post("/nutzer", async (req, res) => {
  try {
    const { vorname, nachname } = req.body;
    const newUser = await pool.query(
      "INSERT INTO Nutzer (vorname, nachname) VALUES ($1, $2) RETURNING *",
      [vorname, nachname], // Use the array to prevent SQL Injection
    );
    res.json(newUser.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/haushalt/:nutzerId", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT * FROM Haushalt h
      LEFT JOIN Haushalt_Zuordnung hz on h.id = hz.Haushalt_Id
      WHERE hz.Nutzer_Id = $1
      ORDER BY h.id ASC
    `,
      [req.params.nutzerId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.patch("/haushalt/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedHaushalt = await pool.query(
      "UPDATE Haushalt SET name = $1 WHERE id = $2 RETURNING *",
      [name, id],
    );

    await log("Renamed Household", null, null, null, id);

    res.json(updatedHaushalt.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post("/haushalt", async (req, res) => {
  try {
    const { nutzerId, name, adresse } = req.body;
    const newHaushalt = await pool.query(
      "INSERT INTO Haushalt (name, adresse) VALUES ($1, $2) RETURNING *",
      [name, adresse], // Use the array to prevent SQL Injection
    );
    const zuordnung = await pool.query(
      "INSERT INTO Haushalt_Zuordnung (nutzer_id, haushalt_id, verwaltet) VALUES ($1, $2, $3) RETURNING *",
      [nutzerId, newHaushalt.rows[0].id, true], // Use the array to prevent SQL Injection
    );

    await log("Household created", null, null, null, newHaushalt.rows[0].id);
    await log(
      "Admin assigned",
      null,
      null,
      null,
      newHaushalt.rows[0].id,
      nutzerId,
    );

    res.json({ newHaushalt, zuordnung });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/haushaltzuordnung/:haushalt_id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT * FROM Haushalt_Zuordnung hz
      JOIN Nutzer n on hz.nutzer_id = n.id
      WHERE hz.haushalt_id = $1
      ORDER BY hz.id ASC
    `,
      [req.params.haushalt_id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post("/haushaltzuordnung/:haushalt_id", async (req, res) => {
  try {
    const { nutzerId } = req.body;
    const zuordnung = await pool.query(
      "INSERT INTO Haushalt_Zuordnung (nutzer_id, haushalt_id, verwaltet) VALUES ($1, $2, $3) RETURNING *",
      [nutzerId, req.params.haushalt_id, false], // Use the array to prevent SQL Injection
    );

    await log(
      "Added Member",
      null,
      null,
      null,
      req.params.haushalt_id,
      nutzerId,
    );

    res.json({ zuordnung });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.patch("/haushaltzuordnung/:haushalt_id", async (req, res) => {
  try {
    const { haushalt_id } = req.params;
    const { nutzer_id, verwaltet } = req.body;
    const updated = await pool.query(
      "UPDATE Haushalt_Zuordnung SET verwaltet = $1 WHERE haushalt_id = $2 AND nutzer_id = $3 RETURNING *",
      [verwaltet, haushalt_id, nutzer_id],
    );
    log(
      "User got assigned " + (verwaltet ? "Admin" : "Member"),
      null,
      null,
      null,
      haushalt_id,
      nutzer_id,
    );
    res.json(updated.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.delete("/haushaltzuordnung/:haushalt_id", async (req, res) => {
  try {
    const { haushalt_id } = req.params;
    const { nutzer_id, deleteHouse } = req.query;

    if (deleteHouse === "true") {
      await pool.query("DELETE FROM Haushalt WHERE id = $1 RETURNING *", [
        haushalt_id,
      ]);
      return res.send("ok");
    }

    const deleted = await pool.query(
      "DELETE FROM Haushalt_Zuordnung WHERE haushalt_id = $1 AND nutzer_id = $2 RETURNING *",
      [haushalt_id, nutzer_id],
    );
    log("Removed User " + nutzer_id + " from Household");
    res.json(deleted.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/raum/:haushalt_id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Raum WHERE Haushalt_id = $1 and deleted = false ORDER BY id ASC",
      [req.params.haushalt_id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post("/raum/:haushalt_id", async (req, res) => {
  try {
    const { name, raum_typ_id } = req.body;
    const newRaum = await pool.query(
      "INSERT INTO Raum (name, haushalt_id, raum_typ_id) VALUES ($1, $2, $3) RETURNING *",
      [name, req.params.haushalt_id, raum_typ_id], // Use the array to prevent SQL Injection
    );
    log(
      "Room " + newRaum.rows[0].id + " created",
      null,
      null,
      newRaum.rows[0].id,
      req.params.haushalt_id,
    );
    res.send(newRaum.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.patch("/raum/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedRaum = await pool.query(
      "UPDATE Raum SET name = $1 WHERE id = $2 RETURNING *",
      [name, id],
    );

    log(
      "Room " + id + " Renamed",
      null,
      null,
      id,
      updatedRaum.rows[0].haushalt_id,
    );

    res.json(updatedRaum.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/geraet/:haushalt_id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT g.* FROM Geraet g
      LEFT JOIN Raum r ON g.Raum_Id = r.id
      WHERE r.Haushalt_Id = $1 AND g.deleted = false
      ORDER BY g.id ASC
    `,
      [req.params.haushalt_id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/geraetId/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT * FROM Geraet
      WHERE id = $1 and deleted = false
    `,
      [req.params.id],
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post("/geraet/:raum_id", async (req, res) => {
  try {
    const { name, geraet_typ_id, schnittstelle } = req.body;
    const newGerät = await pool.query(
      "INSERT INTO Geraet (name, geraet_typ_id, schnittstelle, erstellt_am, raum_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, geraet_typ_id, schnittstelle, new Date(), req.params.raum_id], // Use the array to prevent SQL Injection
    );
    const raum = await pool.query(
      "SELECT haushalt_id FROM Raum WHERE id = $1",
      [req.params.raum_id],
    );
    log(
      "Device " + newGerät.rows[0].id + " created",
      null,
      newGerät.rows[0].id,
      req.params.raum_id,
      raum.rows[0].haushalt_id,
    );
    res.json(newGerät.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.patch("/geraet/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedGerät = await pool.query(
      "UPDATE Geraet SET name = $1 WHERE id = $2 RETURNING *",
      [name, id],
    );

    const haushalt = await pool.query(
      "SELECT haushalt_id FROM Raum WHERE id = $1",
      [updatedGerät.rows[0].raum_id],
    );

    log(
      "Device " + id + " renamed",
      null,
      id,
      updatedGerät.rows[0].raum_id,
      haushalt.rows[0].haushalt_id,
    );

    res.json(updatedGerät.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/schaltvorgaenge/:gerät_id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT * FROM Schaltvorgang s
      LEFT JOIN Zustand z ON s.zustand_id = z.id
      WHERE s.geraet_id = $1
      ORDER BY s.zeitpunkt DESC
    `,
      [req.params.gerät_id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

// ... existing code ...

app.post("/operations", async (req, res) => {
  try {
    const { device_id, type_id, state_id } = req.body;

    if (!device_id || !type_id || !state_id) {
      return res.status(400).send("Missing required fields");
    }

    // Insert new operation (Schaltvorgang)
    const newOperation = await pool.query(
      "INSERT INTO Schaltvorgang (geraet_id, schaltvorgang_typ_id, zustand_id, zeitpunkt) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [device_id, type_id, state_id],
    );

    // Fetch context for the log entry
    const deviceContext = await pool.query(
      `SELECT g.id as geraet_id, r.id as raum_id, r.haushalt_id 
       FROM Geraet g 
       JOIN Raum r ON g.raum_id = r.id 
       WHERE g.id = $1`,
      [device_id],
    );

    // Add entry to the main history log
    if (deviceContext.rows.length > 0) {
      const { geraet_id, raum_id, haushalt_id } = deviceContext.rows[0];
      await log(
        "Operation added manually",
        null,
        geraet_id,
        raum_id,
        haushalt_id,
        null,
      );
    }

    res.json(newOperation.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

// ... existing code ...

app.post("/sensor", async (req, res) => {
  try {
    const { sensor_typ_id, geraet_id } = req.body;
    const newGerät = await pool.query(
      "INSERT INTO Sensor (sensor_typ_id, erstellt_am, geraet_id) VALUES ($1, $2, $3) RETURNING *",
      [sensor_typ_id, new Date(), geraet_id], // Use the array to prevent SQL Injection
    );
    const raum = await pool.query(
      `SELECT g.raum_Id, r.haushalt_id
      FROM Geraet g
      Join Raum r on g.raum_id = r.id
      WHERE g.id = $1`,
      [geraet_id],
    );
    log(
      "Sensor " + newGerät.rows[0].id + " created",
      newGerät.rows[0].id,
      newGerät.rows[0].geraet_id,
      raum.rows[0].raum_id,
      raum.rows[0].haushalt_id,
      null,
    );
    res.json(newGerät.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.delete("/sensor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sensor = await pool.query(
      "DELETE FROM Sensor WHERE id = $1 RETURNING *",
      [id],
    );
    const raum = await pool.query(
      `
      SELECT r.haushalt_id FROM Raum r
      JOIN Geraet g ON r.id = g.raum_id
      WHERE g.id = $1
    `,
      [sensor.rows[0].geraet_id],
    );
    log(
      "Sensor deleted",
      sensor.rows[0].id,
      sensor.rows[0].geraet_id,
      sensor.rows[0].raum_id,
      raum.rows[0].haushalt_id,
    );
    res.json(sensor.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/sensor/:geraet_id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT * FROM Sensor
      WHERE geraet_id = $1
      ORDER BY id ASC
    `,
      [req.params.geraet_id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.post("/messungen", async (req, res) => {
  try {
    // We expect 'value', 'threshold', and 'sensor_id' from the frontend
    const { sensor_id, wert, schwellenwert } = req.body;

    // Validate inputs
    if (!wert || !schwellenwert || !sensor_id) {
      return res
        .status(400)
        .send("Missing required fields: value, threshold, or sensor_id");
    }

    const newMeasurement = await pool.query(
      "INSERT INTO Messwert (wert, schwellenwert, sensor_id, zeitpunkt) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [wert, schwellenwert, sensor_id],
    );

    res.json(newMeasurement.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/messungen/:sensor_id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT * FROM Messwert
      WHERE sensor_id = $1
      ORDER BY zeitpunkt DESC
    `,
      [req.params.sensor_id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/typen", async (req, res) => {
  try {
    const raum_typ = (
      await pool.query("SELECT * FROM Raum_Typ ORDER BY id ASC")
    ).rows;
    const geraet_typ = (
      await pool.query("SELECT * FROM Geraet_Typ ORDER BY id ASC")
    ).rows;
    const schaltvorgang_typ = (
      await pool.query("SELECT * FROM Schaltvorgang_Typ ORDER BY id ASC")
    ).rows;
    const sensor_typ = (
      await pool.query("SELECT * FROM Sensor_Typ ORDER BY id ASC")
    ).rows;
    const alarm_typ = (
      await pool.query("SELECT * FROM Alarm_Typ ORDER BY id ASC")
    ).rows;
    const zustand = (await pool.query("SELECT * FROM Zustand ORDER BY id ASC"))
      .rows;

    res.json({
      raum_typ,
      geraet_typ,
      schaltvorgang_typ,
      sensor_typ,
      alarm_typ,
      zustand,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.delete("/haushalt/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const haushalt = await pool.query(
      "DELETE FROM Haushalt WHERE id = $1 RETURNING *",
      [id],
    );
    res.json(haushalt.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.delete("/raum/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const raum = await pool.query(
      "UPDATE Raum SET deleted = true WHERE id = $1 RETURNING *",
      [id],
    );
    log("Room deleted", null, null, raum.rows[0].id, raum.rows[0].haushalt_id);
    res.json(raum.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.delete("/geraet/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const geraet = await pool.query(
      "UPDATE Geraet SET deleted = true WHERE id = $1 RETURNING *",
      [id],
    );
    const raum = await pool.query(
      "SELECT haushalt_id FROM Raum WHERE id = $1",
      [geraet.rows[0].raum_id],
    );
    log(
      "Device deleted",
      null,
      geraet.rows[0].id,
      geraet.rows[0].raum_id,
      raum.rows[0].haushalt_id,
    );
    res.json(geraet.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/deleteAccount", async (req, res) => {
  try {
    const { nutzer_id } = req.query;
    const housesThatWillBeDeleted = await pool.query(
      `
      SELECT h.* FROM Haushalt h
      JOIN Haushalt_Zuordnung hz on h.id = hz.haushalt_id
      WHERE hz.verwaltet = true
      GROUP BY h.id
      HAVING COUNT(hz.nutzer_id) = 1
        AND MIN(hz.nutzer_id) = $1
    `,
      [nutzer_id],
    ); // Select all houses where the user is the ONLY admin

    res.send(housesThatWillBeDeleted.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});
app.delete("/deleteAccount", async (req, res) => {
  try {
    const { nutzer_id } = req.query;
    const housesThatWillBeDeleted = await pool.query(
      `
      SELECT h.* FROM Haushalt h
      JOIN Haushalt_Zuordnung hz on h.id = hz.haushalt_id
      WHERE hz.verwaltet = true
      GROUP BY h.id
      HAVING COUNT(hz.nutzer_id) = 1
        AND MIN(hz.nutzer_id) = $1
    `,
      [nutzer_id],
    ); // Select all houses where the user is the ONLY admin

    for (const house of housesThatWillBeDeleted.rows) {
      const deletedHouse = await pool.query(
        "DELETE FROM Haushalt WHERE id = $1",
        [house.id],
      );
    }
    const deletedUser = await pool.query("DELETE FROM Nutzer WHERE id = $1", [
      nutzer_id,
    ]);
    res.send(deletedUser.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/verlauf/:haushalt_id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        v.*,
        n.vorname as nutzer_vorname, n.nachname as nutzer_nachname,
        s.sensor_typ_id,
        g.name as geraet_name,
        r.name as raum_name,
        h.name as haushalt_name
      FROM Verlauf v
      LEFT JOIN Nutzer n ON v.Nutzer_Id = n.id
      LEFT JOIN Sensor s ON v.Sensor_Id = s.id
      LEFT JOIN Geraet g ON v.Geraet_Id = g.id
      LEFT JOIN Raum r ON v.Raum_Id = r.id
      LEFT JOIN Haushalt h ON v.Haushalt_Id = h.id
      WHERE v.haushalt_id = $1
      ORDER BY v.Zeitpunkt DESC
      `,
      [req.params.haushalt_id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});
app.get("/latestActivity/:haushalt_id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        v.*,
        n.vorname as nutzer_vorname, n.nachname as nutzer_nachname,
        s.sensor_typ_id,
        g.name as geraet_name,
        r.name as raum_name,
        h.name as haushalt_name
      FROM Verlauf v
      LEFT JOIN Nutzer n ON v.Nutzer_Id = n.id
      LEFT JOIN Sensor s ON v.Sensor_Id = s.id
      LEFT JOIN Geraet g ON v.Geraet_Id = g.id
      LEFT JOIN Raum r ON v.Raum_Id = r.id
      LEFT JOIN Haushalt h ON v.Haushalt_Id = h.id
      WHERE v.haushalt_id = $1
      ORDER BY v.Zeitpunkt DESC
      LIMIT 1
      `,
      [req.params.haushalt_id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/roomDeviceCount/:haushalt_id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT r.id, COUNT(g.id) as anzahl_geraete
      FROM Raum r
      WHERE r.haushalt_id = $1
      LEFT JOIN Geraet g ON r.id = g.raum_id
      GROUP BY r.id
    `,
      [req.params.haushalt_id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.get("/averageReading/:geraet_id", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT s.id, AVG(m.wert) as durchschnittswert
      FROM Sensor s
      WHERE s.geraet_id = $1
      JOIN Messwert m ON s.id = m.sensor_id
      GROUP BY s.id
    `,
      [req.params.geraet_id],
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));

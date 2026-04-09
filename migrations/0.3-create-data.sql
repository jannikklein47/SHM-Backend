-- =================================================================================
-- SMART HOME MANAGEMENT - ENTERPRISE TEST DATA SEED SCRIPT
-- =================================================================================

-- 1. Security Foundation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Users (15 Users, all with the same hashed password)
-- Note: Mapped perfectly to your "User" table, accounting for the 4 expected columns.
INSERT INTO "User" (name, surname, username, password) VALUES 
('Alice', 'Smith', 'asmith', crypt('smartpass123', gen_salt('bf', 14))),
('Bob', 'Johnson', 'bjohnson', crypt('smartpass123', gen_salt('bf', 14))),
('Charlie', 'Williams', 'cwilliams', crypt('smartpass123', gen_salt('bf', 14))),
('Diana', 'Brown', 'dbrown', crypt('smartpass123', gen_salt('bf', 14))),
('Evan', 'Jones', 'ejones', crypt('smartpass123', gen_salt('bf', 14))),
('Fiona', 'Garcia', 'fgarcia', crypt('smartpass123', gen_salt('bf', 14))),
('George', 'Miller', 'gmiller', crypt('smartpass123', gen_salt('bf', 14))),
('Hannah', 'Davis', 'hdavis', crypt('smartpass123', gen_salt('bf', 14))),
('Ian', 'Rodriguez', 'irodriguez', crypt('smartpass123', gen_salt('bf', 14))),
('Julia', 'Martinez', 'jmartinez', crypt('smartpass123', gen_salt('bf', 14))),
('Kevin', 'Hernandez', 'khernandez', crypt('smartpass123', gen_salt('bf', 14))),
('Laura', 'Lopez', 'llopez', crypt('smartpass123', gen_salt('bf', 14))),
('Mike', 'Gonzalez', 'mgonzalez', crypt('smartpass123', gen_salt('bf', 14))),
('Nina', 'Wilson', 'nwilson', crypt('smartpass123', gen_salt('bf', 14))),
('Oscar', 'Anderson', 'oanderson', crypt('smartpass123', gen_salt('bf', 14)));

-- 3. Households (10 Households)
INSERT INTO Household (name, address) VALUES 
('Smith Family Home', '123 Maple Street, Springfield'),
('Johnson Estate', '456 Oak Avenue, Metropolis'),
('Williams Apartment', '789 Pine Road, Apt 4B, Gotham'),
('Brown Residence', '321 Elm Street, Star City'),
('Jones Loft', '654 Birch Lane, Central City'),
('Garcia Villa', '987 Cedar Court, Coast City'),
('Miller Townhouse', '147 Walnut Way, Bludhaven'),
('Davis Cottage', '258 Chestnut Drive, Fawcett City'),
('Rodriguez Manor', '369 Spruce Circle, Hub City'),
('Martinez Studio', '741 Ash Boulevard, Keystone City');

INSERT INTO History (description, sensorId, deviceId, roomId, householdId, timestamp)
SELECT 'Household created', NULL, NULL, NULL, h.id, CURRENT_TIMESTAMP - interval '48 hours'
FROM Household h;

-- 4. Household Assignments (Distributing the 15 users across 10 homes)
-- Ensures every home has at least 1 manager.
WITH Assignments AS (
    SELECT 'Smith Family Home' AS h_name, 'asmith' AS u_name, true AS is_mgr UNION ALL
    SELECT 'Smith Family Home', 'bjohnson', false UNION ALL
    SELECT 'Smith Family Home', 'cwilliams', false UNION ALL
    SELECT 'Johnson Estate', 'dbrown', true UNION ALL
    SELECT 'Johnson Estate', 'ejones', false UNION ALL
    SELECT 'Williams Apartment', 'fgarcia', true UNION ALL
    SELECT 'Brown Residence', 'gmiller', true UNION ALL
    SELECT 'Brown Residence', 'hdavis', false UNION ALL
    SELECT 'Brown Residence', 'irodriguez', false UNION ALL
    SELECT 'Brown Residence', 'jmartinez', false UNION ALL
    SELECT 'Jones Loft', 'khernandez', true UNION ALL
    SELECT 'Garcia Villa', 'llopez', true UNION ALL
    SELECT 'Miller Townhouse', 'mgonzalez', true UNION ALL
    SELECT 'Davis Cottage', 'nwilson', true UNION ALL
    SELECT 'Rodriguez Manor', 'oanderson', true UNION ALL
    SELECT 'Martinez Studio', 'asmith', true -- Alice manages a second property
)
INSERT INTO HouseholdAssignment (householdId, userId, manages)
SELECT h.id, u.id, a.is_mgr
FROM Assignments a
JOIN Household h ON h.name = a.h_name
JOIN "User" u ON u.username = a.u_name;

INSERT INTO History (description, sensorId, deviceId, roomId, householdId, userId, timestamp)
SELECT CASE WHEN ha.manages THEN 'User got assigned Admin' ELSE 'Added Member' END, NULL, NULL, NULL, h.id, u.id, CASE WHEN ha.manages THEN CURRENT_TIMESTAMP - interval '47 hours' ELSE CURRENT_TIMESTAMP - interval '45 hours' END
FROM Household h
JOIN HouseholdAssignment ha ON h.id = ha.householdId
JOIN "User" u ON ha.userId = u.id;

-- 5. Rooms (40 Rooms: Every household gets a Living Room, Kitchen, Bedroom, and Garage)
INSERT INTO Room (name, householdId, roomTypeId)
SELECT 
    rt.name || ' - ' || h.name, 
    h.id, 
    rt.id
FROM Household h
CROSS JOIN RoomType rt
WHERE rt.name IN ('Living Room', 'Kitchen', 'Bedroom', 'Garage');

INSERT INTO History (description, sensorId, deviceId, roomId, householdId, timestamp)
SELECT 'Room created', NULL, NULL, r.id, h.id, CURRENT_TIMESTAMP - interval '47 hours'
FROM Room r
JOIN Household h ON r.householdId = h.id;


-- 6. Devices (80-100 Devices distributed logically by room type)
-- A. Smart Lights (2 per Living Room, 1 per Kitchen, 1 per Bedroom) = 40 Lights
INSERT INTO Device (name, deviceTypeId, interfaceId, roomId)
SELECT 'Main Ceiling Light', dt.id, i.id, r.id
FROM Room r
JOIN DeviceType dt ON dt.name = 'Smart Light'
JOIN Interface i ON i.name = 'WiFi'
WHERE r.name LIKE 'Living Room%' OR r.name LIKE 'Kitchen%' OR r.name LIKE 'Bedroom%';

INSERT INTO Device (name, deviceTypeId, interfaceId, roomId)
SELECT 'Accent Lamp', dt.id, i.id, r.id
FROM Room r
JOIN DeviceType dt ON dt.name = 'Smart Light'
JOIN Interface i ON i.name = 'ZigBee'
WHERE r.name LIKE 'Living Room%';

-- B. Thermostats (1 per Living Room) = 10 Thermostats
INSERT INTO Device (name, deviceTypeId, interfaceId, roomId)
SELECT 'Main Thermostat', dt.id, i.id, r.id
FROM Room r
JOIN DeviceType dt ON dt.name = 'Thermostat'
JOIN Interface i ON i.name = 'WiFi'
WHERE r.name LIKE 'Living Room%';

-- C. Smart Locks & Security Cameras (1 of each per Garage) = 20 Devices
INSERT INTO Device (name, deviceTypeId, interfaceId, roomId)
SELECT 'Garage Entry Lock', dt.id, i.id, r.id
FROM Room r
JOIN DeviceType dt ON dt.name = 'Smart Lock'
JOIN Interface i ON i.name = 'ZigBee'
WHERE r.name LIKE 'Garage%';

INSERT INTO Device (name, deviceTypeId, interfaceId, roomId)
SELECT 'Driveway Camera', dt.id, i.id, r.id
FROM Room r
JOIN DeviceType dt ON dt.name = 'Security Camera'
JOIN Interface i ON i.name = 'Ethernet'
WHERE r.name LIKE 'Garage%';

INSERT INTO History (description, sensorId, deviceId, roomId, householdId, timestamp)
SELECT 'Device created', NULL, d.id, r.id, h.id, CURRENT_TIMESTAMP - interval '46 hours'
FROM Device d
JOIN Room r ON d.roomId = r.id
JOIN Household h ON r.householdId = h.id;

-- 7. Sensors (Attached to Devices based on Device Logic)
-- Thermostats get Temperature and Humidity
INSERT INTO Sensor (deviceId, sensorTypeId, threshold)
SELECT d.id, st.id, CASE WHEN st.name = 'Temperature' THEN 21 WHEN st.name = 'Humidity' THEN 70 END
FROM Device d
JOIN DeviceType dt ON d.deviceTypeId = dt.id
CROSS JOIN SensorType st
WHERE dt.name = 'Thermostat' AND st.name IN ('Temperature', 'Humidity');

-- Security Cameras get Motion Sensors
INSERT INTO Sensor (deviceId, sensorTypeId, threshold)
SELECT d.id, st.id, 1
FROM Device d
JOIN DeviceType dt ON d.deviceTypeId = dt.id
JOIN SensorType st ON st.name = 'Motion'
WHERE dt.name = 'Security Camera';

INSERT INTO History (description, sensorId, deviceId, roomId, householdId, timestamp)
SELECT 'Sensor created', s.id, d.id, r.id, h.id, CURRENT_TIMESTAMP - interval '45 hours'
FROM Sensor s
JOIN Device d ON s.deviceId = d.id
JOIN Room r ON d.roomId = r.id
JOIN Household h ON r.householdId = h.id;

-- 8. Operations (Attached to Devices based on Device Logic)
-- Smart Lights get Power (On/Off) and Brightness (High/Medium/Low)
INSERT INTO Operation (deviceId, operationTypeId, stateId)
SELECT d.id, ot.id, s.id
FROM Device d
JOIN DeviceType dt ON d.deviceTypeId = dt.id
JOIN OperationType ot ON ot.name = 'Power'
JOIN State s ON s.name = 'On' AND s.operationTypeId = ot.id
WHERE dt.name = 'Smart Light';

INSERT INTO Operation (deviceId, operationTypeId, stateId, timestamp)
SELECT d.id, ot.id, s.id, CURRENT_TIMESTAMP - interval '43 hours'
FROM Device d
JOIN DeviceType dt ON d.deviceTypeId = dt.id
JOIN OperationType ot ON ot.name = 'Brightness'
JOIN State s ON s.name = 'High' AND s.operationTypeId = ot.id
WHERE dt.name = 'Smart Light';

INSERT INTO History (description, sensorId, deviceId, roomId, householdId, timestamp)
SELECT 'Operation committed', NULL, d.id, r.id, h.id, o.timestamp
FROM Operation o
JOIN Device d ON o.deviceId = d.id
JOIN Room r ON d.roomId = r.id
JOIN Household h ON r.householdId = h.id;


-- 9. Measurements (1,000+ Measurements over the last 48 hours)
INSERT INTO Measurement (sensorId, value, timestamp)
WITH TimeSeries AS (
    SELECT 
        s.id,
        st.name as sensor_type,
        CURRENT_TIMESTAMP - (n * interval '15 minutes') as ts -- Increased density for smoother curves
    FROM Sensor s
    JOIN SensorType st ON s.sensorTypeId = st.id
    CROSS JOIN generate_series(1, 1344) AS n -- 14 days of data
),
CalculatedWaves AS (
    SELECT 
        *,
        extract(epoch from ts) as e,
        -- 24-hour cycle
        sin(extract(epoch from ts) * 2 * pi() / 86400 - (15 * pi() / 12)) as daily_wave,
        -- 7-day cycle (simulates weather systems)
        sin(extract(epoch from ts) * 2 * pi() / 604800) as weekly_trend,
        -- 3-hour "noise" wave
        sin(extract(epoch from ts) * 2 * pi() / 10800) as local_fluctuation,
        sin(extract(epoch from ts) * 2 * pi() / 2419200) as seasonal_wave
    FROM TimeSeries
)
SELECT 
    id,
    CASE 
        WHEN sensor_type = 'Temperature' THEN 
            ROUND(CAST(
                20.0 -- Base Temp
                + (random() * (random() + 1) * 4 * daily_wave)      -- Main day/night swing
                + (random() * 5 * weekly_trend)    -- Long term weather change
                + ((random()) * local_fluctuation) -- Small local variation
                - ((4 + random() * 4) * seasonal_wave)
                + (random() * 0.2)        -- Actual sensor noise
            AS numeric), 2)
            
        WHEN sensor_type = 'Humidity' THEN 
            ROUND(CAST(
                60.0 
                - (4.0 * daily_wave)     -- Inverted to temperature
                + ((5 + 5 * random()) * weekly_trend)    -- Humid vs Dry weeks
                + (2.0 * local_fluctuation)
                + (10 * seasonal_wave)
                + (random() * 0.2)
            AS numeric), 2)

        WHEN sensor_type = 'Motion' THEN 
            -- Probability-based motion: More likely during 8am-6pm
            CASE 
                WHEN extract(hour from ts) BETWEEN 8 AND 18 
                THEN (CASE WHEN random() > 0.7 THEN 1 ELSE 0 END) 
                ELSE (CASE WHEN random() > 0.95 THEN 1 ELSE 0 END)
            END
            
        ELSE ROUND(CAST(50.0 + (5.0 * daily_wave) + (random() * 2.0) AS numeric), 2)
    END,
    ts
FROM CalculatedWaves;

-- 10. Alarms
INSERT INTO Alarm (measurementId)
SELECT m.id
FROM Measurement m
LEFT JOIN Sensor s ON m.sensorId = s.id
WHERE m.value > s.threshold;






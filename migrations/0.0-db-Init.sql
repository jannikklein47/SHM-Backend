-- So that the test data can be loaded into the database in hashed form.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS HouseholdAssignment CASCADE;
DROP TABLE IF EXISTS History CASCADE;
DROP TABLE IF EXISTS Alarm CASCADE;
DROP TABLE IF EXISTS Measurement CASCADE;
DROP TABLE IF EXISTS Sensor CASCADE;
DROP TABLE IF EXISTS Operation CASCADE;
DROP TABLE IF EXISTS Device CASCADE;
DROP TABLE IF EXISTS Room CASCADE;
DROP TABLE IF EXISTS RoomType CASCADE;
DROP TABLE IF EXISTS Interface CASCADE;
DROP TABLE IF EXISTS OperationType CASCADE;
DROP TABLE IF EXISTS State CASCADE;
DROP TABLE IF EXISTS DeviceType CASCADE;
DROP TABLE IF EXISTS SensorType CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS Household CASCADE;
DROP TABLE IF EXISTS DeviceTypeOperations CASCADE;

CREATE TABLE RoomType (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL
);

CREATE TABLE DeviceType (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    icon VARCHAR(256) NOT NULL DEFAULT 'sensors'
);

CREATE TABLE Interface (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL
);

CREATE TABLE OperationType (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL
);

CREATE TABLE State (
    id SERIAL PRIMARY KEY,
    operationTypeId INTEGER NOT NULL,
    name VARCHAR(256) NOT NULL,
    FOREIGN KEY (operationTypeId) REFERENCES OperationType(id) ON DELETE CASCADE
);

CREATE TABLE SensorType (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL
);

CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    surname VARCHAR(256) NOT NULL,
    username VARCHAR(256) NOT NULL UNIQUE,
    password VARCHAR(256) NOT NULL

);

CREATE TABLE Household (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    address VARCHAR(1024) NOT NULL
);

CREATE TABLE Room (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    householdId INTEGER NOT NULL,
    roomTypeId INTEGER NOT NULL,
    deleted BOOLEAN DEFAULT false,
    FOREIGN KEY (householdId) REFERENCES Household(id) ON DELETE CASCADE,
    FOREIGN KEY (roomTypeId) REFERENCES RoomType(id) ON DELETE CASCADE
);

CREATE TABLE Device (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    deviceTypeId INTEGER NOT NULL,
    interfaceId INTEGER NOT NULL,
    roomId INTEGER NOT NULL,
    deleted BOOLEAN DEFAULT false,
	createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roomId) REFERENCES Room(id) ON DELETE CASCADE,
    FOREIGN KEY (deviceTypeId) REFERENCES DeviceType(id) ON DELETE CASCADE,
    FOREIGN KEY (interfaceId) REFERENCES Interface(id) ON DELETE CASCADE
);

CREATE TABLE Operation (
    id SERIAL PRIMARY KEY,
    deviceId INTEGER NOT NULL,
    operationTypeId INTEGER NOT NULL,
    stateId INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deviceId) REFERENCES Device(id) ON DELETE CASCADE,
    FOREIGN KEY (operationTypeId) REFERENCES OperationType(id) ON DELETE CASCADE,
    FOREIGN KEY (stateId) REFERENCES State(id) ON DELETE CASCADE
);

CREATE TABLE Sensor (
    id SERIAL PRIMARY KEY,
    deviceId INTEGER NOT NULL,
    sensorTypeId INTEGER NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT false,
    FOREIGN KEY (deviceId) REFERENCES Device(id) ON DELETE CASCADE,
    FOREIGN KEY (sensorTypeId) REFERENCES SensorType(id) ON DELETE CASCADE
);

CREATE TABLE Measurement (
    id SERIAL PRIMARY KEY,
    sensorId INTEGER NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    threshold DECIMAL(10,2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensorId) REFERENCES Sensor(id) ON DELETE CASCADE
);

CREATE TABLE Alarm (
    id SERIAL PRIMARY KEY,
    measurementId INTEGER NOT NULL,
    FOREIGN KEY (measurementId) REFERENCES Measurement(id) ON DELETE CASCADE
);

CREATE TABLE History (
    id SERIAL PRIMARY KEY,
    description VARCHAR(1024) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    userId INTEGER,
    householdId INTEGER NOT NULL,
    roomId INTEGER,
    deviceId INTEGER,
    sensorId INTEGER,
    FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE SET NULL,
    FOREIGN KEY (householdId) REFERENCES Household(id) ON DELETE CASCADE,
    FOREIGN KEY (roomId) REFERENCES Room(id) ON DELETE SET NULL,
    FOREIGN KEY (deviceId) REFERENCES Device(id) ON DELETE SET NULL,
    FOREIGN KEY (sensorId) REFERENCES Sensor(id) ON DELETE SET NULL
);

CREATE TABLE HouseholdAssignment (
    id SERIAL PRIMARY KEY,
    householdId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
	manages BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (userId, householdId),
    FOREIGN KEY (householdId) REFERENCES Household(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE DeviceTypeOperations (
	id SERIAL PRIMARY KEY,
	deviceTypeId INTEGER NOT NULL,
	operationTypeId INTEGER NOT NULL,
	UNIQUE (deviceTypeId, operationTypeId),
	FOREIGN KEY (deviceTypeId) REFERENCES DeviceType(id) ON DELETE CASCADE,
	FOREIGN KEY (operationTypeId) REFERENCES OperationType(id) ON DELETE CASCADE
);

CREATE OR REPLACE VIEW vAlarmStatistics AS
SELECT 
    a.id AS alarmId,
    s.id AS sensorId,
    st.Name AS sensorType,
    m.value,
    m.threshold,
    ABS(m.value - m.threshold) AS deviation,
    ROUND(((m.value / m.threshold) - 1) * 100, 2) AS exceededPercent,
    m.timestamp
FROM Alarm a
JOIN Measurement m ON a.measurementId = m.id
JOIN Sensor s ON m.sensorId = s.id
JOIN SensorType st ON s.sensorTypeId = st.id;
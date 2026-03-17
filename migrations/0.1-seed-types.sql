INSERT INTO RoomType (name) VALUES 
('Living Room'), ('Kitchen'), ('Bedroom'), ('Garage'), ('Office');

INSERT INTO DeviceType (name) VALUES 
('Smart Light'), ('Thermostat'), ('Smart Lock'), ('Security Camera');

INSERT INTO Interface (name) VALUES 
('WiFi'), ('Ethernet'), ('ZigBee'), ('HomeAssistant');

INSERT INTO SensorType (name) VALUES 
('Temperature'), ('Motion'), ('Humidity'), ('Luminosity'), ('CO2');

-- Operations for Smart Light (ID: 1) and Thermostat (ID: 2)
INSERT INTO OperationType (name) VALUES 
('Power'), 
('Brightness'),
('Temperature'),
('Mode'),
('Lock');

-- States for Smart Light (ID: 1), Thermostat (ID: 2), and Smart Lock (ID: 3)
INSERT INTO State (operationTypeId, name) VALUES 
(1, 'On'), 
(1, 'Off'),
(2, 'Low'),
(2, 'Medium'),
(2, 'High'),
(3, 'Low'),
(3, 'Medium'),
(3, 'High'),
(4, 'Home'),
(4, 'Away'),
(5, 'Locked'),
(5, 'Unlocked');

INSERT INTO DeviceTypeOperations (deviceTypeId, operationTypeId) VALUES
(1,1),(1,2),(2,1),(2,3),(3,5),(4,1);
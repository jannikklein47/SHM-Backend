-- Raum_Typ
INSERT INTO Raum_Typ (Name) VALUES
('Wohnzimmer'),
('Küche'),
('Schlafzimmer'),
('Badezimmer'),
('Büro'),
('Flur');

-- Geraet_Typ
INSERT INTO Geraet_Typ (Name) VALUES
('Smart Glühbirne'),
('Smart Stecker'),
('Temperatursensor'),
('Bewegungsmelder'),
('Heizkörperthermostat'),
('Alarmanlage');

-- Schaltvorgang_Typ
INSERT INTO Schaltvorgang_Typ (Name) VALUES
('An/Aus'),
('Helligkeit'),
('Temperatur_setzen'),
('Modus_wechseln');

-- Sensor_Typ
INSERT INTO Sensor_Typ (Name) VALUES
('Temperatur'),
('Luftfeuchtigkeit'),
('Licht'),
('Anwesenheit');

-- Alarm_Typ
INSERT INTO Alarm_Typ (Name) VALUES
('Hohe Temperatur'),
('Niedrige Temperatur'),
('Unerwartete Bewegung'),
('Unterschreitung Schwellenwert');

-- Zustand
INSERT INTO Zustand (Name) VALUES
('An'),
('Aus'),
('Gedimmt (50%)'),
('Hell (100%)'),
('Heizen'),
('Bereit');


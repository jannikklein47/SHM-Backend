DROP TABLE IF EXISTS Alarm CASCADE;
DROP TABLE IF EXISTS Messwert CASCADE;
DROP TABLE IF EXISTS Sensor CASCADE;
DROP TABLE IF EXISTS Schaltvorgang CASCADE;
DROP TABLE IF EXISTS Geraet CASCADE;
DROP TABLE IF EXISTS Raum CASCADE;
DROP TABLE IF EXISTS Haushalt_Zuordnung CASCADE;
DROP TABLE IF EXISTS Haushalt CASCADE;
DROP TABLE IF EXISTS Nutzer CASCADE;

-- Typ-Tabellen
DROP TABLE IF EXISTS Zustand CASCADE;
DROP TABLE IF EXISTS Alarm_Typ CASCADE;
DROP TABLE IF EXISTS Sensor_Typ CASCADE;
DROP TABLE IF EXISTS Schaltvorgang_Typ CASCADE;
DROP TABLE IF EXISTS Geraet_Typ CASCADE;
DROP TABLE IF EXISTS Raum_Typ CASCADE;

-- Typen

CREATE TABLE Raum_Typ (
	id SERIAL not null primary key UNIQUE,
	Name VARCHAR(256) not null
);

CREATE TABLE Geraet_Typ (
	id SERIAL primary key not null UNIQUE,
	Name VARCHAR(256) not null
);

CREATE TABLE Schaltvorgang_Typ (
	id SERIAL primary key not null UNIQUE,
	Name VARCHAR(256) not null
);

CREATE TABLE Sensor_Typ (
	id SERIAL primary key not null UNIQUE,
	Name VARCHAR(256) not null
);

CREATE TABLE Alarm_Typ (
	id SERIAL primary key not null UNIQUE,
	Name VARCHAR(256) not null
);

CREATE TABLE Zustand (
	id SERIAL primary key not null UNIQUE,
	Name VARCHAR(256) not null
);

-- Allgemeines

CREATE TABLE Nutzer (
	id	SERIAL primary key not null UNIQUE,
	Vorname VARCHAR(128) not null,
	Nachname VARCHAR(128) not null
);

CREATE TABLE Haushalt (
	id	SERIAL primary key not null UNIQUE,
	Name VARCHAR(256) not null,
	Adresse VARCHAR(1024) not null
);

CREATE TABLE Haushalt_Zuordnung (
	id	SERIAL primary key not null UNIQUE,
	Nutzer_Id INTEGER not null references Nutzer(id),
	Haushalt_Id INTEGER not null references Haushalt(id),
	Verwaltet BOOLEAN not null
);

CREATE TABLE Raum (
	id	SERIAL primary key not null UNIQUE,
	Name VARCHAR(256) not null,
	Haushalt_Id INTEGER not null references Haushalt(id),
	Raum_Typ_Id INTEGER not null references Raum_Typ(id)
);

CREATE TABLE Geraet (
	id	SERIAL primary key not null UNIQUE,
	Name VARCHAR(256) not null,
	Geraet_Typ_Id INTEGER not null references Geraet_Typ(id),
	Schnittstelle VARCHAR(256),
	Erstellt_Am timestamp default NOW(),
	Raum_Id INTEGER not null references Raum(id)
);

CREATE TABLE Schaltvorgang (
	id	SERIAL primary key not null UNIQUE,
	Schaltvorgang_Typ_Id INTEGER not null references Schaltvorgang_Typ(id),
	Zeitpunkt timestamp default NOW(),
	Geraet_Id INTEGER not null references Geraet(id),
	Zustand_Id INTEGER not null references Zustand(id)
);

CREATE TABLE Sensor (
	id	SERIAL primary key not null UNIQUE,
	Sensor_Typ_Id INTEGER not null references Sensor_Typ(id),
	Erstellt_Am timestamp default NOW(),
	Geraet_Id INTEGER not null references Geraet(id)
);

CREATE TABLE Messwert (
	id	SERIAL primary key not null UNIQUE,
	Wert DECIMAL not null,
	Schwellenwert DECIMAL not null,
	Zeitpunkt timestamp default NOW(),
	Sensor_Id INTEGER not null references Sensor(id)
);

CREATE TABLE Alarm (
	id	SERIAL primary key not null UNIQUE,
	Alarm_Typ_Id INTEGER not null references Alarm_Typ(id),
	Zeitpunkt timestamp default NOW(),
	Messwert_Id INTEGER not null references Messwert(id)
);

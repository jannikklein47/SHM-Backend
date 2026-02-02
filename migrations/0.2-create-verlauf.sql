CREATE TABLE Verlauf (
    id SERIAL primary key not null UNIQUE,
    Zeitpunkt timestamp default NOW(),
    Beschreibung VARCHAR(512),
    Sensor_Id INTEGER references Sensor(id) ON DELETE SET NULL,
    Geraet_Id INTEGER references Geraet(id) ON DELETE SET NULL,
    Raum_Id INTEGER references Raum(id) ON DELETE SET NULL,
    Haushalt_Id INTEGER NOT NULL references Haushalt(id) ON DELETE CASCADE,
    Nutzer_Id INTEGER references Nutzer(id) ON DELETE SET NULL
)
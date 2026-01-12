ALTER TABLE Haushalt_Zuordnung
ADD CONSTRAINT eindeutig UNIQUE (Nutzer_Id, Haushalt_Id);
CREATE OR REPLACE VIEW v_Alarm_Statistik AS
SELECT 
    a.id AS Alarm_ID,
    s.id AS Sensor_ID,
    st.Name AS Messart,
    m.Wert,
    m.Schwellenwert,
    ABS(m.Wert - m.Schwellenwert) AS Abweichung,
    ROUND(((m.Wert / m.Schwellenwert) - 1) * 100, 2) AS Ueberschreitung_Prozent,
    a.Zeitpunkt
FROM Alarm a
JOIN Messwert m ON a.Messwert_Id = m.id
JOIN Sensor s ON m.Sensor_Id = s.id
JOIN Sensor_Typ st ON s.Sensor_Typ_Id = st.id;
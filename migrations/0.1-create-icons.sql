-- =================================================================================
-- SMART HOME MANAGEMENT - DEVICE TYPE ICONS PATCH
-- =================================================================================

UPDATE DeviceType 
SET icon = 'light' 
WHERE name = 'Smart Light';

UPDATE DeviceType 
SET icon = 'thermostat' 
WHERE name = 'Thermostat';

UPDATE DeviceType 
SET icon = 'lock' 
WHERE name = 'Smart Lock';

UPDATE DeviceType 
SET icon = 'videocam' 
WHERE name = 'Security Camera';
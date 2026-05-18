-- @query
-- @param radiusMeter Float
-- @param lng Float
-- @param lat Float
SELECT 
  id, 
  name, 
  contactEmail, 
  contactPhone, 
  ST_AsText(location) as location_text
FROM Supplier
WHERE ST_DWithin(
  location, 
  ST_SetSRID(ST_MakePoint(@lng, @lat), 4326)::geography, 
  @radiusMeter
)
ORDER BY location <-> ST_SetSRID(ST_MakePoint(@lng, @lat), 4326)::geography
LIMIT 100;

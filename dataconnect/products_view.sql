-- Rocío App: Products View for Tiered Pricing

-- Option A: Standard SQL View
-- This view joins the users table with the tier_prices table to automatically
-- resolve the correct price for every SKU based on the user's assigned tier.
CREATE OR REPLACE VIEW vw_user_products AS
SELECT 
    u.id AS user_id,
    u.is_corporate,
    pt.name AS tier_name,
    b.name AS brand_name,
    p.id AS product_id,
    p.name_ar AS product_name_ar,
    p.name_en AS product_name_en,
    s.id AS sku_id,
    s.daftra_id,
    s.uom,
    s.size,
    tp.price
FROM users u
JOIN price_tiers pt ON u.tier_id = pt.id
-- CROSS JOIN ensures we evaluate every SKU against the user's tier
CROSS JOIN skus s
JOIN products p ON s.product_id = p.id
JOIN brands b ON p.brand_id = b.id
-- The crucial join: match the SKU and the User's Tier to get the exact price
JOIN tier_prices tp ON tp.sku_id = s.id AND tp.tier_id = u.tier_id;


-- Option B: Parameterized SQL Function (Recommended for Performance)
-- If you want to query by a specific user ID rather than querying a massive view:
CREATE OR REPLACE FUNCTION get_products_for_user(p_user_id VARCHAR)
RETURNS TABLE (
    product_id UUID,
    name_ar VARCHAR,
    name_en VARCHAR,
    brand_name VARCHAR,
    sku_id UUID,
    daftra_id VARCHAR,
    uom uom_enum,
    size VARCHAR,
    price NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name_ar,
        p.name_en,
        b.name,
        s.id,
        s.daftra_id,
        s.uom,
        s.size,
        tp.price
    FROM users u
    JOIN skus s ON TRUE -- Evaluate all SKUs
    JOIN products p ON s.product_id = p.id
    JOIN brands b ON p.brand_id = b.id
    -- Fetch the specific price for this SKU and this User's Tier
    JOIN tier_prices tp ON tp.sku_id = s.id AND tp.tier_id = u.tier_id
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

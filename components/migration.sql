-- Rocío App: Firebase Data Connect PostgreSQL Migration Script

-- 1. Create Price Tiers
CREATE TABLE price_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Users (Linked to Firebase Auth UID)
CREATE TABLE users (
    id VARCHAR(128) PRIMARY KEY, -- Firebase Auth UID
    tier_id UUID REFERENCES price_tiers(id) ON DELETE SET NULL,
    is_corporate BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Brands
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create SKUs (with Daftra ERP Integration)
CREATE TYPE uom_enum AS ENUM ('PCS', 'CTN', 'DUM');

CREATE TABLE skus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    daftra_id VARCHAR(100) UNIQUE NOT NULL,
    uom uom_enum NOT NULL,
    size VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Tier Prices (The Relational Pricing Table)
CREATE TABLE tier_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    tier_id UUID NOT NULL REFERENCES price_tiers(id) ON DELETE CASCADE,
    price NUMERIC(10, 2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sku_id, tier_id) -- Ensures a SKU only has one price per tier
);

-- Indexes for performance
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_skus_product_id ON skus(product_id);
CREATE INDEX idx_tier_prices_sku_id ON tier_prices(sku_id);
CREATE INDEX idx_tier_prices_tier_id ON tier_prices(tier_id);

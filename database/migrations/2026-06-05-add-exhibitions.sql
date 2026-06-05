-- Migration: add exhibitions table to an existing DB volume.
-- Apply this when you cannot afford `npm run down -v` (which would wipe all data
-- and re-run init.sql from scratch).
--
-- Usage from the host (PowerShell or bash):
--   docker exec -i webshop_template-db-1 mysql -umagnus -psecretPassword webshop < database/migrations/2026-06-05-add-exhibitions.sql
--
-- Or, if the container name is different on your machine:
--   docker ps                                                                # find the db container name
--   docker exec -i <db-container> mysql -u<user> -p<password> webshop < database/migrations/2026-06-05-add-exhibitions.sql

CREATE TABLE IF NOT EXISTS exhibitions (
    exhibition_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NULL,
    external_url VARCHAR(500) NULL,
    event_start_date DATE NOT NULL,
    event_end_date DATE NOT NULL,
    display_from DATE NOT NULL,
    display_until DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Composite index that powers the public /exhibitions/active query.
-- Defined as a standalone CREATE INDEX to match the convention in init.sql.
CREATE INDEX idx_exhibitions_visibility ON exhibitions(is_active, display_from, display_until);

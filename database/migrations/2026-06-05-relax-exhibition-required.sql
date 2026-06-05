-- Migration: drop NOT NULL constraints from exhibitions text + date columns
-- so the admin form can save partial data (empty strings or null dates).
--
-- Apply from the host:
--   docker exec -i webshop_template-db-1 mysql -umagnus -psecretPassword webshop \
--     < database/migrations/2026-06-05-relax-exhibition-required.sql

ALTER TABLE exhibitions
    MODIFY COLUMN title VARCHAR(255) NOT NULL DEFAULT '',
    MODIFY COLUMN description TEXT NULL,
    MODIFY COLUMN location VARCHAR(255) NOT NULL DEFAULT '',
    MODIFY COLUMN event_start_date DATE NULL,
    MODIFY COLUMN event_end_date DATE NULL,
    MODIFY COLUMN display_from DATE NULL,
    MODIFY COLUMN display_until DATE NULL;

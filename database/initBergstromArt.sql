-- Clean up existing products and related data
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM product_images;
DELETE FROM product_categories;
DELETE FROM cart_items;
DELETE FROM order_items;
DELETE FROM products;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert new products
INSERT INTO products (name, slug, description, price, stock_quantity, is_active) VALUES
('Dancing on the Square', 'dancing-on-the-square', 'Original artwork', 8000.00, 1, TRUE),
('Everything is Possible', 'everything-is-possible', 'Original artwork', 8000.00, 1, TRUE),
('Into the Water', 'into-the-water', 'Original artwork', 8000.00, 1, TRUE),
('Into the Woods', 'into-the-woods', 'Original artwork', 8000.00, 1, TRUE),
('Love My Hair', 'love-my-hair', 'Original artwork', 8000.00, 1, TRUE),
('Nukaka Greenland Forever', 'nukaka-greenland-forever', 'Original artwork', 8000.00, 1, TRUE),
('Perfect Storm', 'perfect-storm', 'Original artwork', 8000.00, 1, TRUE),
('Rainy Day', 'rainy-day', 'Original artwork', 8000.00, 1, TRUE),
('Saved', 'saved', 'Original artwork', 8000.00, 1, TRUE),
('Silent Retreat', 'silent-retreat', 'Original artwork', 8000.00, 1, TRUE),
('Stitching Up', 'stitching-up', 'Original artwork', 8000.00, 1, TRUE);

-- Link all paintings to the "Oliemaleri" category
INSERT INTO product_categories (product_id, category_id)
SELECT p.product_id, c.category_id
FROM products p
JOIN categories c ON c.slug = 'oliemaleri';

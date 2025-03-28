-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL NOT NULL
);

-- Insert 3 sample products
INSERT INTO products (name, price) VALUES 
('Product 1', 10.00),
('Product 2', 20.00),
('Product 3', 30.00);
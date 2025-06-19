-- Database creation
CREATE DATABASE IF NOT EXISTS webshop;
USE webshop;

-- Drop existing tables in dependency order
DROP TABLE IF EXISTS wishlist_items;
DROP TABLE IF EXISTS wishlists;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS discounts;
DROP TABLE IF EXISTS order_status_history;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS variant_attributes;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS product_attributes;
DROP TABLE IF EXISTS attribute_values;
DROP TABLE IF EXISTS attributes;
DROP TABLE IF EXISTS product_categories;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS user_addresses;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- Create tables
-- Roles table
CREATE TABLE roles (
    role_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id INT UNSIGNED NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- User addresses
CREATE TABLE user_addresses (
    address_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    address_type ENUM('billing', 'shipping') NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Categories table
CREATE TABLE categories (
    category_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_category_id INT UNSIGNED NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- Products table
CREATE TABLE products (
    product_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stripe_product_id VARCHAR(255) UNIQUE,
    stripe_price_id VARCHAR(255) UNIQUE,
    sale_price DECIMAL(10, 2) CHECK (sale_price >= 0),
    stock_quantity MEDIUMINT UNSIGNED NOT NULL DEFAULT 0,
    sku VARCHAR(50) UNIQUE,
    weight DECIMAL(8, 2) CHECK (weight >= 0),
    dimensions VARCHAR(50),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Product images
CREATE TABLE product_images (
    image_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order TINYINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_categories (
  product_id   INT UNSIGNED NOT NULL,
  category_id  INT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, category_id),
  FOREIGN KEY (product_id)   REFERENCES products(product_id)   ON DELETE CASCADE,
  FOREIGN KEY (category_id)  REFERENCES categories(category_id) ON DELETE CASCADE
);

-- Product attributes
CREATE TABLE attributes (
    attribute_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product attribute values
CREATE TABLE attribute_values (
    attribute_value_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attribute_id INT UNSIGNED NOT NULL,
    value VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attribute_id) REFERENCES attributes(attribute_id) ON DELETE CASCADE
);

-- Product attribute mapping
CREATE TABLE product_attributes (
    product_id INT UNSIGNED NOT NULL,
    attribute_value_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (product_id, attribute_value_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(attribute_value_id) ON DELETE CASCADE
);

-- Product variants
CREATE TABLE product_variants (
    variant_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    sku VARCHAR(50) UNIQUE,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    sale_price DECIMAL(10, 2) CHECK (sale_price >= 0),
    stock_quantity INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Product variant attribute mapping
CREATE TABLE variant_attributes (
    variant_id INT UNSIGNED NOT NULL,
    attribute_value_id INT UNSIGNED NOT NULL,
    PRIMARY KEY (variant_id, attribute_value_id),
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(attribute_value_id) ON DELETE CASCADE
);

-- Carts table
CREATE TABLE carts (
    cart_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Cart items
CREATE TABLE cart_items (
    cart_item_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    variant_id INT UNSIGNED,
    quantity SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE SET NULL
);

-- Orders table
-- ORDERS (always guest, optional user link)
CREATE TABLE orders (
  order_id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED               NULL,
  guest_name        VARCHAR(320)    NOT NULL,
  guest_email       VARCHAR(150)    NOT NULL,
  session_id        VARCHAR(255)    NULL,
  stripe_session_id VARCHAR(255) NULL,
  status            ENUM(
                      'pending',
                      'processing',
                      'shipped',
                      'delivered',
                      'cancelled',
                      'refunded'
                    )              NOT NULL DEFAULT 'pending',
  subtotal          DECIMAL(10,2)   NOT NULL CHECK (subtotal >= 0),
  tax_amount        DECIMAL(10,2)   NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  shipping_amount   DECIMAL(10,2)   NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
  discount_amount   DECIMAL(10,2)   NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount      DECIMAL(10,2)   NOT NULL CHECK (total_amount >= 0),
  shipping_address  VARCHAR(500)    NOT NULL,
  billing_address   VARCHAR(500)    NOT NULL,
  payment_method    VARCHAR(50)     NULL,
  tracking_number   VARCHAR(100)    NULL,
  notes             TEXT            NULL,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE SET NULL
);


-- ORDER ITEMS
CREATE TABLE order_items (
  order_item_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id        INT UNSIGNED               NOT NULL,
  product_id      INT UNSIGNED               NOT NULL,
  variant_id      INT UNSIGNED               NULL,
  quantity        INT                        NOT NULL,
  unit_price      DECIMAL(10,2)              NOT NULL CHECK (unit_price >= 0),
  stripe_price_id VARCHAR(255) NULL,
  subtotal        DECIMAL(12,2)              NOT NULL CHECK (subtotal >= 0),
  FOREIGN KEY (order_id)
    REFERENCES orders(order_id)
    ON DELETE CASCADE,
  FOREIGN KEY (product_id)
    REFERENCES products(product_id)
    ON DELETE CASCADE,
  FOREIGN KEY (variant_id)
    REFERENCES product_variants(variant_id)
    ON DELETE SET NULL
);


-- ORDER STATUS HISTORY
CREATE TABLE order_status_history (
  history_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id      INT UNSIGNED               NOT NULL,
  status        ENUM(
                   'pending',
                   'processing',
                   'shipped',
                   'delivered',
                   'cancelled',
                   'refunded'
                 )              NOT NULL,
  comment       TEXT                       NULL,
  created_by    INT UNSIGNED               NULL,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)
    REFERENCES orders(order_id)
    ON DELETE CASCADE,
  FOREIGN KEY (created_by)
    REFERENCES users(user_id)
    ON DELETE SET NULL
);


-- Discounts table
CREATE TABLE discounts (
    discount_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    type ENUM('percentage', 'fixed_amount') NOT NULL,
    value DECIMAL(10, 2) NOT NULL CHECK (value >= 0),
    minimum_order_amount DECIMAL(10, 2) CHECK (minimum_order_amount >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    usage_limit INT UNSIGNED,
    used_count INT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Product reviews
CREATE TABLE reviews (
    review_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(100),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Wishlists
CREATE TABLE wishlists (
    wishlist_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT 'Default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Wishlist items
CREATE TABLE wishlist_items (
    wishlist_id INT UNSIGNED NOT NULL,
    product_id INT UNSIGNED NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (wishlist_id, product_id),
    FOREIGN KEY (wishlist_id) REFERENCES wishlists(wishlist_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_pc_product   ON product_categories(product_id);
CREATE INDEX idx_pc_category  ON product_categories(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_session ON carts(session_id);

CREATE INDEX idx_product_name ON products(name);
CREATE INDEX idx_product_slug ON products(slug);
CREATE INDEX idx_category_slug ON categories(slug);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- Insert dummy data

-- Roles
INSERT INTO roles (role_name, description) VALUES 
('admin', 'Administrator with full access'),
('customer', 'Regular customer'),
('manager', 'Store manager with limited admin access');

-- Users
INSERT INTO users (role_id, email, password, first_name, last_name, phone, is_active) VALUES 
(1, 'admin@example.com', 'Password', 'Admin', 'User', '+1234567890', true),
(2, 'john.doe@example.com', 'Password', 'John', 'Doe', '+1987654321', true),
(2, 'jane.smith@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Smith', '+1122334455', true),
(3, 'manager@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Store', 'Manager', '+1555666777', true),
(2, 'bob.johnson@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob', 'Johnson', '+1444333222', true);

-- User addresses
INSERT INTO user_addresses (user_id, address_type, is_default, street_address, city, state, postal_code, country) VALUES 
(2, 'billing', true, '123 Main St', 'New York', 'NY', '10001', 'USA'),
(2, 'shipping', true, '123 Main St', 'New York', 'NY', '10001', 'USA'),
(3, 'billing', true, '456 Park Ave', 'Boston', 'MA', '02108', 'USA'),
(3, 'shipping', true, '789 Work Blvd', 'Boston', 'MA', '02110', 'USA'),
(5, 'billing', true, '101 Lake St', 'Chicago', 'IL', '60601', 'USA'),
(5, 'shipping', true, '101 Lake St', 'Chicago', 'IL', '60601', 'USA');

-- Categories
INSERT INTO categories (name, slug, description, image_url, is_active) VALUES
 
('Oliemaleri', 'oliemaleri', 'Olie på lærred', '/images/categories/olie.jpg', true),
('Stregtegning', 'stregtegning', 'Blyant på papir', '/images/categories/stregtegning.jpg', true),
('Portræt på bestilling', 'portraet-på-bestilling', 'DU KAN BESTILLE DIT EGET UNIKKE PORTRÆT', '/images/categories/unik.jpg', true),
('Bryllup & begivenheder', 'Bryllup-&-begivenhede', 'Gæster maler med', '/images/categories/bryllup.jpg', true);

INSERT INTO products
  (name, slug, description, price, sale_price, stock_quantity, sku, weight, dimensions, is_featured, is_active)
VALUES
  ('Disrupted Human - Keep Swimming',
   'disrupted-human-keep-swimming',
   'Hvor skal vi hen? Indad, udad, videre, dybere. Det er ikke altid destinationen er klar for udenforstående, men vi er ganske ofte et nyt sted i næste moment.',
   8500.00, NULL, 1, NULL, NULL, '100x92 cm', false, true),

  ('Disrupted Human - No Words',
   'disrupted-human-no-words',
   NULL,
   8500.00, NULL, 1, NULL, NULL, '90x90 cm', false, true),

  ('Disrupted Human - Drawn by Infinity',
   'disrupted-human-drawn-by-infinity',
   'Det er både facinerende, smukt og lidt skræmmende på samme tid. Tanken om uendeligheden. Er vi ligegyldige eller en vigtig brik i et kæmpe puslespil?',
   8500.00, NULL, 1, NULL, NULL, '116x90 cm', false, true),

  ('Disrupted Human - Lost in Cyberspace',
   'disrupted-human-lost-in-cyberspace',
   'Er det mennesket, der styrer cyberspace eller er det cyberspace, der styrer mennesket? Under alle omstændigheder har algoritmen gjort sit for at opløse den menneskelige natur.',
   8500.00, NULL, 1, NULL, NULL, '116x90 cm', false, true),

  ('Disrupted Human - Last Summer',
   'disrupted-human-last-summer',
   'Hukommelsen er mærkelig; fortiden toner frem i små forstyrrede glimt som et gammelt tv-signal med atmosfæriske forstyrrelser.',
   8500.00, NULL, 1, NULL, NULL, '90x90 cm', false, true),

  ('Disrupted Human - Being a Wallflower',
   'disrupted-human-being-a-wallflower',
   'Næsten usynlig, men alligevel tilstede og uundgåelig. Omgivelserne har sat spor.',
   9500.00, NULL, 1, NULL, NULL, '73x93 cm', false, true),

  ('Transition, Pink',
   'transition-pink',
   NULL,
   8500.00, NULL, 1, NULL, NULL, '81x100 cm', false, true),

  ('Transition, Yellow',
   'transition-yellow',
   NULL,
   8500.00, NULL, 1, NULL, NULL, '90x90 cm', false, true),

  ('Transition, Green',
   'transition-green',
   NULL,
   8500.00, NULL, 1, NULL, NULL, '80x96 cm', false, true),

  ('Colors make me live',
   'colors-make-me-live',
   NULL,
   1250.00, NULL, 1, NULL, NULL, '150x200', false, true),

  ('Go with the flow, pink',
   'go-with-the-flow-pink',
   NULL,
   7500.00, NULL, 1, NULL, NULL, '73x93', false, true),

  ('Go with the flow, yellow',
   'go-with-the-flow-yellow',
   NULL,
   7500.00, NULL, 1, NULL, NULL, '73x93', false, true),

  ('Power of Joy - Grounded',
   'power-of-joy-grounded',
   NULL,
   9500.00, NULL, 1, NULL, NULL, '100x100 cm', false, true),

  ('Power of Joy - Monday Morning',
   'power-of-joy-monday-morning',
   NULL,
   9500.00, NULL, 1, NULL, NULL, '100x100 cm', false, true),

  ('Power of Joy - Marvellous Memory',
   'power-of-joy-marvellous-memory',
   NULL,
   9500.00, NULL, 1, NULL, NULL, '100x100 cm', false, true),

  ('Power of Joy - Healing Laughter',
   'power-of-joy-healing-laughter',
   NULL,
   9500.00, NULL, 1, NULL, NULL, '100x100 cm', false, true),

  ('Power of Joy - Deep Breathing',
   'power-of-joy-deep-breathing',
   NULL,
   12500.00, NULL, 1, NULL, NULL, '100x150 cm', false, true),

  ('Power of Joy - Reunited',
   'power-of-joy-reunited',
   NULL,
   12500.00, NULL, 1, NULL, NULL, '100x150 cm', false, true);


-- 1) Link every painting to the “Oliemaleri” category
INSERT INTO product_categories (product_id, category_id)
SELECT p.product_id, c.category_id
FROM products p
JOIN categories c ON c.slug = 'oliemaleri';


-- 2) Create a “Technique” attribute and remember its ID
INSERT INTO attributes (name) VALUES ('Technique');
SET @tech_id = LAST_INSERT_ID();


-- 3) Define all painting techniques as attribute values
INSERT INTO attribute_values (attribute_id, value) VALUES
  (@tech_id, 'Malet med bølgepap'),
  (@tech_id, 'Malet med spatel'),
  (@tech_id, 'Malet med bobleplast'),
  (@tech_id, 'Malet med svamp'),
  (@tech_id, 'Malet med pensel');


-- 4) Map each painting to its technique via product_attributes

INSERT INTO product_attributes (product_id, attribute_value_id)

-- BØLGEPAP
SELECT p.product_id, av.attribute_value_id
FROM products p
JOIN attribute_values av
  ON av.attribute_id = @tech_id
 AND av.value = 'Malet med bølgepap'
WHERE p.slug IN (
  'disrupted-human-keep-swimming',
  'disrupted-human-last-summer'
)

UNION ALL

-- SPATEL
SELECT p.product_id, av.attribute_value_id
FROM products p
JOIN attribute_values av
  ON av.attribute_id = @tech_id
 AND av.value = 'Malet med spatel'
WHERE p.slug IN (
  'disrupted-human-no-words',
  'power-of-joy-grounded',
  'power-of-joy-monday-morning',
  'power-of-joy-marvellous-memory',
  'power-of-joy-healing-laughter',
  'power-of-joy-deep-breathing',
  'power-of-joy-reunited'
)

UNION ALL

-- BOBLEPLAST
SELECT p.product_id, av.attribute_value_id
FROM products p
JOIN attribute_values av
  ON av.attribute_id = @tech_id
 AND av.value = 'Malet med bobleplast'
WHERE p.slug IN (
  'disrupted-human-drawn-by-infinity',
  'disrupted-human-lost-in-cyberspace'
)

UNION ALL

-- SVAMP
SELECT p.product_id, av.attribute_value_id
FROM products p
JOIN attribute_values av
  ON av.attribute_id = @tech_id
 AND av.value = 'Malet med svamp'
WHERE p.slug = 'disrupted-human-being-a-wallflower'

UNION ALL

-- PENSEL
SELECT p.product_id, av.attribute_value_id
FROM products p
JOIN attribute_values av
  ON av.attribute_id = @tech_id
 AND av.value = 'Malet med pensel'
WHERE p.slug IN (
  'transition-pink',
  'transition-yellow',
  'transition-green',
  'colors-make-me-live',
  'go-with-the-flow-pink',
  'go-with-the-flow-yellow'
);


-- Attributes
-- INSERT INTO attributes (name) VALUES 
-- ('Color'),
-- ('Size'),
-- ('Material'),
-- ('Storage'),
-- ('RAM');

-- -- Attribute values
-- INSERT INTO attribute_values (attribute_id, value) VALUES 
-- (1, 'Black'),
-- (1, 'White'),
-- (1, 'Blue'),
-- (1, 'Red'),
-- (2, 'S'),
-- (2, 'M'),
-- (2, 'L'),
-- (2, 'XL'),
-- (3, 'Cotton'),
-- (3, 'Polyester'),
-- (3, 'Denim'),
-- (3, 'Stainless Steel'),
-- (4, '128GB'),
-- (4, '256GB'),
-- (4, '512GB'),
-- (5, '8GB'),
-- (5, '16GB'),
-- (5, '32GB');

-- Product attributes
-- INSERT INTO product_attributes (product_id, attribute_value_id) VALUES 
-- (1, 1), -- Smartphone - Black
-- (1, 13), -- Smartphone - 128GB
-- (1, 16), -- Smartphone - 8GB RAM
-- (2, 1), -- Laptop - Black
-- (2, 15), -- Laptop - 512GB
-- (2, 18), -- Laptop - 32GB RAM
-- (3, 11), -- Jeans - Denim
-- (4, 3), -- Dress - Blue
-- (4, 9), -- Dress - Cotton
-- (7, 12), -- Pan Set - Stainless Steel
-- (8, 1); -- Coffee Maker - Black

-- Product variants
-- INSERT INTO product_variants (product_id, sku, price, sale_price, stock_quantity, is_active) VALUES 
-- (1, 'PHN-X-001-BLK-128', 999.99, NULL, 30, true),
-- (1, 'PHN-X-001-WHT-128', 999.99, NULL, 20, true),
-- (1, 'PHN-X-001-BLK-256', 1099.99, NULL, 15, true),
-- (1, 'PHN-X-001-WHT-256', 1099.99, NULL, 10, true),
-- (3, 'MEN-JN-001-S', 59.99, NULL, 25, true),
-- (3, 'MEN-JN-001-M', 59.99, NULL, 30, true),
-- (3, 'MEN-JN-001-L', 59.99, NULL, 35, true),
-- (3, 'MEN-JN-001-XL', 59.99, NULL, 10, true),
-- (4, 'WMN-DRS-001-S', 79.99, 69.99, 5, true),
-- (4, 'WMN-DRS-001-M', 79.99, 69.99, 15, true),
-- (4, 'WMN-DRS-001-L', 79.99, 69.99, 10, true);

-- Variant attributes
-- INSERT INTO variant_attributes (variant_id, attribute_value_id) VALUES 
-- (1, 1), -- Black smartphone
-- (1, 13), -- 128GB storage
-- (2, 2), -- White smartphone
-- (2, 13), -- 128GB storage
-- (3, 1), -- Black smartphone
-- (3, 14), -- 256GB storage
-- (4, 2), -- White smartphone
-- (4, 14), -- 256GB storage
-- (5, 5), -- S size jeans
-- (6, 6), -- M size jeans
-- (7, 7), -- L size jeans
-- (8, 8), -- XL size jeans
-- (9, 5), -- S size dress
-- (10, 6), -- M size dress
-- (11, 7); -- L size dress

-- Carts
INSERT INTO carts (user_id, session_id) VALUES 
(2, NULL),
(3, NULL),
(NULL, 'guest_session_12345'),
(NULL, 'guest_session_67890');

-- Cart items
-- INSERT INTO cart_items (cart_id, product_id, variant_id, quantity) VALUES 
-- (1, 1, 1, 1), -- John added a black 128GB smartphone
-- (1, 7, NULL, 2), -- John added 2 pan sets
-- (2, 4, 10, 1), -- Jane added a medium dress
-- (2, 6, NULL, 1), -- Jane added a cooking book
-- (3, 8, NULL, 1), -- Guest added a coffee maker
-- (4, 5, NULL, 2); -- Another guest added 2 mystery books

-- Orders
-- Orders
-- Orders
INSERT INTO orders (
    user_id,
    guest_name,
    guest_email,
    status,
    total_amount,
    subtotal,
    tax_amount,
    shipping_amount,
    discount_amount,
    shipping_address,
    billing_address,
    payment_method,
    tracking_number
) VALUES
  -- John’s first delivered order
  (
    2,
    'John Doe',
    'john.doe@example.com',
    'delivered',
    1059.99,
    999.99,
    50.00,
    10.00,
    0.00,
    '123 Main St, New York, NY 10001, USA',
    '123 Main St, New York, NY 10001, USA',
    'credit_card',
    'TRK123456789'
  ),

  -- Jane’s shipped order
  (
    3,
    'Jane Smith',
    'jane.smith@example.com',
    'shipped',
    134.98,
    119.98,
    10.00,
    5.00,
    0.00,
    '789 Work Blvd, Boston, MA 02110, USA',
    '456 Park Ave, Boston, MA 02108, USA',
    'paypal',
    'TRK987654321'
  ),

  -- John’s processing order
  (
    2,
    'John Doe',
    'john.doe@example.com',
    'processing',
    384.97,
    359.97,
    25.00,
    0.00,
    0.00,
    '123 Main St, New York, NY 10001, USA',
    '123 Main St, New York, NY 10001, USA',
    'credit_card',
    NULL
  ),

  -- Bob’s pending order
  (
    5,
    'Bob Johnson',
    'bob.johnson@example.com',
    'pending',
    129.99,
    119.99,
    10.00,
    0.00,
    0.00,
    '101 Lake St, Chicago, IL 60601, USA',
    '101 Lake St, Chicago, IL 60601, USA',
    'bank_transfer',
    NULL
  ),

  -- Jane’s cancelled order
  (
    3,
    'Jane Smith',
    'jane.smith@example.com',
    'cancelled',
    24.99,
    24.99,
    0.00,
    0.00,
    0.00,
    '789 Work Blvd, Boston, MA 02110, USA',
    '456 Park Ave, Boston, MA 02108, USA',
    'credit_card',
    NULL
  );



-- Order items
-- INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price, subtotal) VALUES 
-- (1, 1, 1, 1, 999.99, 999.99), -- John ordered a black 128GB smartphone
-- (2, 5, NULL, 1, 24.99, 24.99), -- Jane ordered a mystery book
-- (2, 6, NULL, 1, 34.99, 34.99), -- Jane ordered a cooking book
-- (2, 4, 10, 1, 69.99, 69.99), -- Jane ordered a medium dress
-- (3, 7, NULL, 2, 149.99, 299.98), -- John ordered 2 pan sets
-- (3, 8, NULL, 1, 119.99, 119.99), -- John ordered a coffee maker
-- (4, 8, NULL, 1, 119.99, 119.99), -- Bob ordered a coffee maker
-- (5, 5, NULL, 1, 24.99, 24.99); -- Jane ordered a mystery book but cancelled

-- Order status history
-- INSERT INTO order_status_history (order_id, status, comment, created_by) VALUES 
-- (1, 'pending', 'Order received', 1),
-- (1, 'processing', 'Payment confirmed', 1),
-- (1, 'shipped', 'Order shipped via Express Delivery', 1),
-- (1, 'delivered', 'Order delivered and signed for', 1),
-- (2, 'pending', 'Order received', 1),
-- (2, 'processing', 'Payment confirmed', 1),
-- (2, 'shipped', 'Order shipped via Standard Delivery', 1),
-- (3, 'pending', 'Order received', 1),
-- (3, 'processing', 'Payment confirmed', 1),
-- (4, 'pending', 'Awaiting payment confirmation', 1),
-- (5, 'pending', 'Order received', 1),
-- (5, 'cancelled', 'Cancelled by customer', 3);

-- Discounts
INSERT INTO discounts (code, type, value, minimum_order_amount, is_active, start_date, end_date, usage_limit, used_count) VALUES 
('SUMMER2025', 'percentage', 15.00, 100.00, true, '2025-06-01 00:00:00', '2025-08-31 23:59:59', 1000, 0),
('WELCOME10', 'percentage', 10.00, 50.00, true, '2025-01-01 00:00:00', '2025-12-31 23:59:59', NULL, 45),
('FREESHIP', 'fixed_amount', 10.00, 75.00, true, '2025-04-01 00:00:00', '2025-05-15 23:59:59', 500, 120),
('FLASH25', 'percentage', 25.00, 200.00, false, '2025-03-10 00:00:00', '2025-03-12 23:59:59', 100, 100);

-- Reviews
-- INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved) VALUES 
-- (1, 2, 5, 'Amazing Phone!', 'This is the best smartphone I have ever owned. The camera quality is superb and battery life is excellent.', true),
-- (1, 3, 4, 'Great but expensive', 'Love the features but wish it was a bit more affordable.', true),
-- (2, 5, 5, 'Perfect for work', 'This laptop has greatly improved my productivity. Fast and reliable.', true),
-- (4, 2, 3, 'Nice but sizing issues', 'The dress looks beautiful but runs small. Had to return for a larger size.', true),
-- (7, 3, 5, 'Professional quality', 'These pans are exactly what I needed for my kitchen. Food cooks evenly and cleaning is easy.', true),
-- (8, 5, 2, 'App is buggy', 'The coffee maker works well but the app constantly disconnects from my phone.', true),
-- (5, 2, 4, 'Gripping story', 'Couldn\'t put this book down! Exciting from start to finish.', false);

-- Wishlists
INSERT INTO wishlists (user_id, name) VALUES 
(2, 'Birthday Wishlist'),
(2, 'Christmas Ideas'),
(3, 'Tech Gadgets'),
(5, 'Kitchen Upgrades');

-- Wishlist items
-- INSERT INTO wishlist_items (wishlist_id, product_id) VALUES 
-- (1, 8), -- John's Birthday Wishlist - Coffee Maker
-- (1, 2), -- John's Birthday Wishlist - Laptop
-- (2, 7), -- John's Christmas Ideas - Pan Set
-- (3, 1), -- Jane's Tech Gadgets - Smartphone
-- (3, 2), -- Jane's Tech Gadgets - Laptop
-- (3, 8), -- Jane's Tech Gadgets - Coffee Maker
-- (4, 7), -- Bob's Kitchen Upgrades - Pan Set
-- (4, 8); -- Bob's Kitchen Upgrades - Coffee Maker
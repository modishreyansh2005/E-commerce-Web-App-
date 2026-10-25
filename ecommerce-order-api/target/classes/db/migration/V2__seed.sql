-- V2__seed.sql: Seed data (2 categories, 5 products, 1 admin user, 1 customer user)

-- Seed Admin (password: admin123) and Customer (password: customer123)
-- BCrypt hashes:
-- 'admin123': $2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW
-- 'customer123': $2a$10$4qJq1y9wP4YF8w/oQ9.EouyqJ49Zp5tB7YvE1iX7Jt7Xw8tW5sL72
INSERT INTO users (id, name, email, password, role, created_at)
VALUES 
    (1, 'Admin User', 'admin@ecommerce.com', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW', 'ADMIN', CURRENT_TIMESTAMP),
    (2, 'John Doe', 'customer@ecommerce.com', '$2a$10$4qJq1y9wP4YF8w/oQ9.EouyqJ49Zp5tB7YvE1iX7Jt7Xw8tW5sL72', 'CUSTOMER', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Seed 2 Categories
INSERT INTO categories (id, name, description)
VALUES 
    (1, 'Electronics', 'Smartphones, laptops, accessories, and home tech'),
    (2, 'Home & Kitchen', 'Modern appliances, cookware, and interior essentials')
ON CONFLICT (id) DO NOTHING;

-- Seed 5 Products
INSERT INTO products (id, name, description, price, stock_quantity, category_id, created_at)
VALUES 
    (1, 'Sony WH-1000XM5 Wireless Headphones', 'Industry-leading noise-canceling over-ear headphones with 30-hour battery life.', 399.99, 45, 1, CURRENT_TIMESTAMP),
    (2, 'Apple MacBook Air M3', '15-inch Liquid Retina display, 16GB Unified Memory, 512GB SSD storage.', 1299.00, 20, 1, CURRENT_TIMESTAMP),
    (3, 'Logitech MX Master 3S Mouse', 'Performance wireless mouse with quiet clicks, 8K DPI sensor, and ergonomic design.', 99.99, 100, 1, CURRENT_TIMESTAMP),
    (4, 'Nespresso Vertuo Pop Coffee Maker', 'Compact single-serve espresso and coffee machine with centrifusion technology.', 129.50, 35, 2, CURRENT_TIMESTAMP),
    (5, 'Instant Pot Duo Plus 9-in-1', 'Electric pressure cooker, slow cooker, rice cooker, steamer, and yogurt maker (6 Quart).', 89.95, 60, 2, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence values for PostgreSQL so next inserts generate from max(id) + 1
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));

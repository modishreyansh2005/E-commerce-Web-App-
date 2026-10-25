-- V3__more_products.sql: Expand catalog with premium categories and 15 diverse products

-- 1. Insert New Categories
INSERT INTO categories (id, name, description)
VALUES 
    (3, 'Audio & Wearables', 'Audiophile headphones, smartwatches, and fitness wearables'),
    (4, 'Smart Home & Office', 'Connected lighting, ergonomic workspace gear, and automation'),
    (5, 'Gaming & Accessories', 'Next-gen consoles, mechanical keyboards, and OLED displays')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert 15 Premium Products (IDs 6 to 20)
INSERT INTO products (id, name, description, price, stock_quantity, category_id, created_at)
VALUES 
    (6, 'Apple Watch Ultra 2', 'Rugged titanium case with precision dual-frequency GPS, 36-hour battery, and depth gauge.', 799.00, 25, 3, CURRENT_TIMESTAMP),
    (7, 'Bose QuietComfort Ultra Earbuds', 'World-class noise cancellation with breakthrough spatialized audio and custom tune sound.', 299.00, 40, 3, CURRENT_TIMESTAMP),
    (8, 'Garmin Fenix 7 Pro Solar', 'Multisport solar-powered GPS smartwatch with built-in LED flashlight and 22-day battery life.', 699.50, 15, 3, CURRENT_TIMESTAMP),
    (9, 'Dyson V15 Detect Cordless Vacuum', 'Laser illumination reveals invisible dust with intelligent piezo sensor calculating particles.', 749.99, 30, 2, CURRENT_TIMESTAMP),
    (10, 'Breville Barista Touch Espresso Machine', 'Automated touchscreen espresso machine with built-in conical burr grinder and thermo-jet heating.', 999.95, 18, 2, CURRENT_TIMESTAMP),
    (11, 'Philips Hue Smart Ambient Starter Kit', 'Dynamic RGB multi-color smart bulb kit with Hue Bridge, syncs with movies, music, and games.', 159.00, 55, 4, CURRENT_TIMESTAMP),
    (12, 'Herman Miller Aeron Ergonomic Chair', 'The benchmark in ergonomic office seating with breathable pellicle mesh and lumbar posture-fit.', 1195.00, 12, 4, CURRENT_TIMESTAMP),
    (13, 'BenQ ScreenBar Halo Monitor Light', 'Intelligent wireless desktop monitor lamp with auto-dimming and ambient back-glow illumination.', 179.00, 65, 4, CURRENT_TIMESTAMP),
    (14, 'Sony PlayStation 5 Slim Console', 'Next-gen gaming power with 1TB SSD, ray tracing, 4K-TV gaming, and DualSense haptic feedback.', 499.99, 35, 5, CURRENT_TIMESTAMP),
    (15, 'ASUS ROG Swift 32" 4K OLED Gaming Monitor', '32-inch 4K UHD QD-OLED display, 240Hz refresh rate, 0.03ms response time, and Dolby Vision.', 1299.00, 10, 5, CURRENT_TIMESTAMP),
    (16, 'Keychron Q1 Pro Wireless Mechanical Keyboard', 'CNC aluminum custom mechanical keyboard with hot-swappable switches and QMK/VIA programmability.', 199.00, 50, 5, CURRENT_TIMESTAMP),
    (17, 'Apple iPad Pro 13-inch M4 OLED', 'Ultra Retina XDR tandem OLED display, incredible M4 performance, and pencil hover precision.', 1299.00, 22, 1, CURRENT_TIMESTAMP),
    (18, 'Samsung Galaxy S24 Ultra 512GB', 'Galaxy AI camera power with Snapdragon 8 Gen 3, titanium armor frame, and built-in S-Pen.', 1199.99, 28, 1, CURRENT_TIMESTAMP),
    (19, 'Sonos Era 300 Spatial Audio Speaker', 'Revolutionary Dolby Atmos spatial speaker with 6 drivers directing sound left, right, and forward.', 449.00, 32, 3, CURRENT_TIMESTAMP),
    (20, 'Ninja Professional Plus Kitchen Blender', '1400-peak-watt motor with Auto-iQ programs for crushing whole fruits and dense veggies in seconds.', 119.99, 48, 2, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 3. Update Sequence values
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));

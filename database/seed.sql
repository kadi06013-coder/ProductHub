-- Optional demo data. Run after schema.sql:  mysql -u root -p my-api < database/seed.sql
INSERT IGNORE INTO categories (name) VALUES ('Electronics'), ('Books'), ('Clothing');

INSERT IGNORE INTO products (category_id, name, description, price, stock, sku, is_active)
SELECT c.id, p.name, p.description, p.price, p.stock, p.sku, p.is_active
FROM (
  SELECT 'Electronics' AS cat, 'Wireless Mouse' AS name, 'Ergonomic 2.4 GHz mouse' AS description, 24.90 AS price, 40 AS stock, 'EL-001' AS sku, 1 AS is_active
  UNION ALL SELECT 'Electronics', 'USB-C Hub', '6-in-1 USB-C hub', 39.00, 0, 'EL-002', 1
  UNION ALL SELECT 'Books', 'Clean Code', 'A handbook of agile software craftsmanship', 35.50, 12, 'BK-001', 1
  UNION ALL SELECT 'Clothing', 'Hoodie', 'Cotton hoodie, unisex', 49.99, 8, 'CL-001', 0
) AS p
JOIN categories c ON c.name = p.cat;

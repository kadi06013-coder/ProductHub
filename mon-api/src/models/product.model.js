const pool = require('../config/db');

/**
 * Find all products with optional filters, pagination and category name
 */
const findAll = async ({ page = 1, limit = 10, category_id, is_active, search } = {}) => {
  const offset = (page - 1) * limit;
  const params = [];

  let query = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE 1=1
  `;

  if (category_id !== undefined) {
    query += ' AND p.category_id = ?';
    params.push(category_id);
  }
  if (is_active !== undefined) {
    query += ' AND p.is_active = ?';
    params.push(is_active);
  }
  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  // Count total rows (for pagination meta)
  const countQuery = `SELECT COUNT(*) AS total FROM (${query}) AS sub`;
  const [[{ total }]] = await pool.query(countQuery, params);

  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const [rows] = await pool.query(query, params);
  return { data: rows, total, page: Number(page), limit: Number(limit) };
};

/**
 * Find a single product by id
 */
const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Create a new product
 */
const create = async ({ category_id, name, description, price, stock, sku, image_url, is_active }) => {
  const [result] = await pool.query(
    `INSERT INTO products (category_id, name, description, price, stock, sku, image_url, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [category_id ?? null, name, description ?? null, price, stock ?? 0, sku ?? null, image_url ?? null, is_active ?? 1]
  );
  return findById(result.insertId);
};

/**
 * Update a product (partial update supported)
 */
const update = async (id, fields) => {
  const allowed = ['category_id', 'name', 'description', 'price', 'stock', 'sku', 'image_url', 'is_active'];
  const updates = [];
  const params = [];

  allowed.forEach((key) => {
    if (fields[key] !== undefined) {
      updates.push(`${key} = ?`);
      params.push(fields[key]);
    }
  });

  if (updates.length === 0) return findById(id);

  params.push(id);
  await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, params);
  return findById(id);
};

/**
 * Delete a product by id
 */
const remove = async (id) => {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = { findAll, findById, create, update, remove };

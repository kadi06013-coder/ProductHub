const pool = require('../config/db');

/** Escape LIKE wildcards so a search for "50%" matches the literal text. */
const escapeLike = (value) => value.replace(/[\\%_]/g, '\\$&');

const buildWhere = ({ category_id, is_active, search }) => {
  const clauses = [];
  const params = [];

  if (category_id !== undefined) {
    clauses.push('p.category_id = ?');
    params.push(category_id);
  }
  if (is_active !== undefined) {
    clauses.push('p.is_active = ?');
    params.push(is_active);
  }
  if (search) {
    clauses.push('(p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)');
    const like = `%${escapeLike(search)}%`;
    params.push(like, like, like);
  }

  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
};

/**
 * Find all products with optional filters, pagination and category name.
 * Inputs are already validated/coerced by the validation middleware.
 */
const findAll = async ({ page = 1, limit = 10, category_id, is_active, search } = {}) => {
  const { where, params } = buildWhere({ category_id, is_active, search });
  const offset = (page - 1) * limit;

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM products p ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     ${where}
     ORDER BY p.created_at DESC, p.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { data: rows, total, page, limit };
};

/** Find a single product by id */
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

/** Dashboard counters computed in SQL (no need to download every product). */
const getStats = async () => {
  const [[row]] = await pool.query(
    `SELECT COUNT(*)                         AS total,
            COALESCE(SUM(is_active = 1), 0)  AS active,
            COALESCE(SUM(stock = 0), 0)      AS out_of_stock
     FROM products`
  );
  return {
    total: Number(row.total),
    active: Number(row.active),
    out_of_stock: Number(row.out_of_stock),
  };
};

/** Create a new product */
const create = async ({ category_id, name, description, price, stock, sku, image_url, is_active }) => {
  const [result] = await pool.query(
    `INSERT INTO products (category_id, name, description, price, stock, sku, image_url, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      category_id ?? null,
      name,
      description || null,
      price,
      stock ?? 0,
      sku || null, // '' would violate the UNIQUE index on sku after the first empty one
      image_url || null,
      is_active ?? 1,
    ]
  );
  return findById(result.insertId);
};

const UPDATABLE = ['category_id', 'name', 'description', 'price', 'stock', 'sku', 'image_url', 'is_active'];
const NULLABLE_EMPTY = ['description', 'sku', 'image_url'];

/**
 * Update a product (partial update supported).
 * Returns the updated product, or null if the id does not exist.
 */
const update = async (id, fields) => {
  const updates = [];
  const params = [];

  UPDATABLE.forEach((key) => {
    if (fields[key] !== undefined) {
      updates.push(`${key} = ?`);
      params.push(NULLABLE_EMPTY.includes(key) && fields[key] === '' ? null : fields[key]);
    }
  });

  if (updates.length > 0) {
    await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, [...params, id]);
  }
  return findById(id);
};

/** Delete a product by id */
const remove = async (id) => {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = { findAll, findById, getStats, create, update, remove };

const pool = require('../config/db');

const findAll = async () => {
    const [rows] = await pool.query(
        'SELECT * FROM categories ORDER BY name ASC'
    );
    return rows;
};

const findById = async (id) => {
    const [rows] = await pool.query(
        'SELECT * FROM categories WHERE id = ?',
        [id]
    );
    return rows[0];
};

const create = async ({ name }) => {
    const [result] = await pool.query(
        'INSERT INTO categories (name) VALUES (?)',
        [name]
    );
    return findById(result.insertId);
};

const update = async (id, { name }) => {
    const [result] = await pool.query(
        'UPDATE categories SET name = ? WHERE id = ?',
        [name, id]
    );

    if (result.affectedRows === 0) return null;

    return findById(id);
};

const remove = async (id) => {
    const [result] = await pool.query(
        'DELETE FROM categories WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
};

module.exports = {
    findAll,
    findById,
    create,
    update,
    remove,
};
const mysql = require('mysql2/promise');
require('dotenv').config();

// No hard-coded credentials: the app refuses to start without a configured DB.
const missing = ['DB_NAME', 'DB_USER'].filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing environment variable(s): ${missing.join(', ')}. Copy .env.example to .env and fill it in.`
  );
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/** Fails fast at startup (called from server.js, not on import, so tests can mock the pool). */
pool.checkConnection = async () => {
  const conn = await pool.getConnection();
  conn.release();
};

module.exports = pool;

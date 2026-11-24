/**
 * API tests — run with `npm test` (needs `npm install` first for supertest).
 * The MySQL pool is replaced by a fake, so no database is required.
 */
process.env.NODE_ENV = 'test';

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const request = require('supertest');

// ── Fake DB pool injected before the app is loaded ─────────────────────────
let handler = async () => [[]];
const calls = [];
const fakePool = {
  query: async (sql, params) => {
    calls.push({ sql, params });
    return handler(sql, params);
  },
};
const dbPath = require.resolve(path.join(__dirname, '../src/config/db.js'));
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: fakePool };

const app = require('../src/app');

beforeEach(() => {
  calls.length = 0;
  handler = async () => [[]];
});

describe('health & routing', () => {
  test('GET /health returns OK', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'OK');
  });

  test('unknown route returns 404 JSON', async () => {
    const res = await request(app).get('/nope');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  test('malformed JSON body returns 400', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Content-Type', 'application/json')
      .send('{"name": ');
    assert.equal(res.status, 400);
    assert.match(res.body.message, /Invalid JSON/);
  });
});

describe('GET /api/products', () => {
  test('returns data with pagination meta', async () => {
    handler = async (sql) =>
      sql.includes('COUNT(*) AS total') ? [[{ total: 25 }]] : [[{ id: 1, name: 'Mouse' }]];

    const res = await request(app).get('/api/products?page=2&limit=10');

    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 1);
    assert.deepEqual(res.body.meta, { total: 25, page: 2, limit: 10, totalPages: 3 });
    // offset must be (page - 1) * limit = 10
    const listCall = calls.find((c) => c.sql.includes('LIMIT'));
    assert.deepEqual(listCall.params.slice(-2), [10, 10]);
  });

  test('rejects invalid pagination values', async () => {
    assert.equal((await request(app).get('/api/products?page=abc')).status, 400);
    assert.equal((await request(app).get('/api/products?page=0')).status, 400);
    assert.equal((await request(app).get('/api/products?limit=1000')).status, 400);
    assert.equal(calls.length, 0, 'no SQL must run for invalid input');
  });

  test('escapes LIKE wildcards in search', async () => {
    handler = async (sql) => (sql.includes('COUNT(*)') ? [[{ total: 0 }]] : [[]]);
    await request(app).get('/api/products?search=50%25');
    const countCall = calls.find((c) => c.sql.includes('COUNT(*)'));
    assert.equal(countCall.params[0], '%50\\%%');
  });
});

describe('GET /api/products/stats', () => {
  test('is not mistaken for an :id and returns numbers', async () => {
    handler = async () => [[{ total: '4', active: '3', out_of_stock: '1' }]];
    const res = await request(app).get('/api/products/stats');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data, { total: 4, active: 3, out_of_stock: 1 });
  });
});

describe('GET /api/products/:id', () => {
  test('non-numeric id returns 400', async () => {
    const res = await request(app).get('/api/products/abc');
    assert.equal(res.status, 400);
  });

  test('unknown id returns 404', async () => {
    const res = await request(app).get('/api/products/999');
    assert.equal(res.status, 404);
  });

  test('existing id returns the product', async () => {
    handler = async () => [[{ id: 7, name: 'Hub' }]];
    const res = await request(app).get('/api/products/7');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.name, 'Hub');
  });
});

describe('POST /api/products', () => {
  test('invalid payload returns 400 with the list of errors', async () => {
    const res = await request(app).post('/api/products').send({ name: 'x', price: -5 });
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.length >= 2);
  });

  test('valid payload creates the product (201)', async () => {
    handler = async (sql) =>
      sql.startsWith('INSERT') ? [{ insertId: 11 }] : [[{ id: 11, name: 'Mouse', price: 24.9 }]];
    const res = await request(app).post('/api/products').send({ name: 'Mouse', price: 24.9 });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.id, 11);
  });

  test('empty sku is stored as NULL (UNIQUE index safe)', async () => {
    handler = async (sql) => (sql.startsWith('INSERT') ? [{ insertId: 1 }] : [[{ id: 1 }]]);
    await request(app).post('/api/products').send({ name: 'Mouse', price: 1, sku: '' });
    const insert = calls.find((c) => c.sql.startsWith('INSERT'));
    assert.equal(insert.params[5], null);
  });
});

describe('PATCH /api/products/:id', () => {
  test('only updates the provided fields (no silent defaults)', async () => {
    handler = async (sql) =>
      sql.startsWith('UPDATE') ? [{ affectedRows: 1 }] : [[{ id: 5, name: 'New' }]];

    const res = await request(app).patch('/api/products/5').send({ name: 'New' });

    assert.equal(res.status, 200);
    const update = calls.find((c) => c.sql.startsWith('UPDATE'));
    assert.match(update.sql, /SET name = \? WHERE id = \?/);
    assert.ok(!update.sql.includes('stock'), 'stock must not be reset by a PATCH');
    assert.ok(!update.sql.includes('is_active'), 'is_active must not be reset by a PATCH');
  });

  test('empty body returns 400', async () => {
    const res = await request(app).patch('/api/products/5').send({});
    assert.equal(res.status, 400);
  });

  test('unknown product returns 404', async () => {
    handler = async (sql) => (sql.startsWith('UPDATE') ? [{ affectedRows: 0 }] : [[]]);
    const res = await request(app).patch('/api/products/5').send({ name: 'New' });
    assert.equal(res.status, 404);
  });
});

describe('categories', () => {
  test('duplicate name returns 409', async () => {
    handler = async () => {
      throw Object.assign(new Error('dup'), { code: 'ER_DUP_ENTRY' });
    };
    const res = await request(app).post('/api/categories').send({ name: 'Books' });
    assert.equal(res.status, 409);
  });

  test('deleting a category still used by products returns 409', async () => {
    handler = async () => {
      throw Object.assign(new Error('fk'), { code: 'ER_ROW_IS_REFERENCED_2' });
    };
    const res = await request(app).delete('/api/categories/3');
    assert.equal(res.status, 409);
    assert.match(res.body.message, /still used/);
  });

  test('name shorter than 2 characters returns 400', async () => {
    const res = await request(app).post('/api/categories').send({ name: 'a' });
    assert.equal(res.status, 400);
  });
});

describe('error handling', () => {
  test('unexpected database errors return a JSON 500', async () => {
    handler = async () => {
      throw new Error('connection refused');
    };
    const res = await request(app).get('/api/categories');
    assert.equal(res.status, 500);
    assert.equal(res.body.success, false);
  });
});

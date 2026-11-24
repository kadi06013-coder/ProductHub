# ProductHub — Product & Category Management

Full-stack CRUD application: **Angular 22** (standalone components, signals) + **Node.js / Express 5** REST API + **MySQL**.

## Features
- Products: create, read, update, delete, search, filter by status, pagination
- Categories: CRUD with unique names; a category still used by products cannot be deleted (clear 409 message)
- Dashboard counters (total / active / out of stock) computed in SQL via `GET /api/products/stats`
- Server-side validation (Joi) for body, query string and `:id` params; API errors are shown in the UI
- Security basics: helmet, restrictive CORS, parameterized SQL, no default DB credentials, no error details leaked in production

## Tech stack
| Layer | Technology |
|---|---|
| Frontend | Angular 22, TypeScript, signals, lazy-loaded routes |
| Backend | Node.js ≥ 20, Express 5, mysql2, Joi, helmet, morgan |
| Database | MySQL 8 |
| Tests | `node:test` + Supertest (API), Vitest + `HttpTestingController` (Angular) |

## Project structure
```
ProductHub/
├── database/
│   ├── schema.sql          # tables, indexes, foreign key
│   └── seed.sql            # optional demo data
├── mon-api/                # Express API
│   ├── server.js           # entry point (DB check, graceful shutdown)
│   ├── tests/              # API tests (no real DB needed)
│   └── src/{config,controllers,middlewares,models,routes,utils}
└── front/                  # Angular app
    └── src/
        ├── environments/   # apiUrl (dev / production)
        └── app/{core,features,shared}
```

## Getting started

### 1. Database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p my-api < database/seed.sql   # optional demo data
```

### 2. Backend
```bash
cd mon-api
cp .env.example .env        # then edit DB_USER / DB_PASSWORD
npm install
npm run dev                 # http://localhost:3000  (health check: /health)
```

### 3. Frontend
```bash
cd front
npm install
npm start                   # http://localhost:4200
```
The API URL is configured in `front/src/environments/environment.ts` (development) and
`environment.production.ts` (production build).

## Tests
```bash
cd mon-api && npm test      # API tests
cd front && npm test        # Angular unit tests
```

## API
Base URL: `http://localhost:3000/api` — all responses look like `{ success, message, data, meta? }`.

| Method | Route | Description |
|---|---|---|
| GET | `/products?page&limit&search&category_id&is_active` | Paginated list (`limit` ≤ 100) |
| GET | `/products/stats` | `{ total, active, out_of_stock }` |
| GET | `/products/:id` | One product |
| POST | `/products` | Create (`name`, `price` required) |
| PUT | `/products/:id` | Full update |
| PATCH | `/products/:id` | Partial update (at least one field) |
| DELETE | `/products/:id` | Delete |
| GET/POST | `/categories` | List / create |
| GET/PUT/DELETE | `/categories/:id` | Read / rename / delete (409 if still used) |

Status codes: `400` validation, `404` not found, `409` duplicate or still referenced, `500` unexpected error.
A Postman collection is available in `.postman/`.

## Configuration (`mon-api/.env`)
| Variable | Required | Description |
|---|---|---|
| `DB_NAME`, `DB_USER` | yes | MySQL database and user |
| `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | no | Defaults: empty, `127.0.0.1`, `3306` |
| `PORT` | no | Default `3000` |
| `CORS_ORIGIN` | in production | Comma-separated allowed front-end origins |
| `NODE_ENV` | no | `production` hides internal error messages |

## Author
**Rim Kadi** — Information Systems Development Student

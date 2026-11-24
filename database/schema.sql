-- ProductHub database schema (MySQL 8+)
-- Usage:  mysql -u root -p < database/schema.sql
-- The database name must match DB_NAME in mon-api/.env (default: my-api).

CREATE DATABASE IF NOT EXISTS `my-api`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `my-api`;

CREATE TABLE IF NOT EXISTS categories (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  category_id INT UNSIGNED  NULL,
  name        VARCHAR(150)  NOT NULL,
  description TEXT          NULL,
  price       DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock       INT UNSIGNED  NOT NULL DEFAULT 0,
  sku         VARCHAR(50)   NULL,
  image_url   VARCHAR(255)  NULL,
  is_active   TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_products_sku (sku),
  KEY idx_products_category (category_id),
  KEY idx_products_active_created (is_active, created_at),
  -- RESTRICT: a category that still has products cannot be deleted
  -- (the API answers 409 instead of silently orphaning products).
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

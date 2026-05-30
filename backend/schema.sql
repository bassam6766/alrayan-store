-- ===============================================
-- Al-Rayan Store — MySQL Schema
-- ===============================================

CREATE DATABASE IF NOT EXISTS alrayan_store
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE alrayan_store;

-- ----------- Admins -----------
CREATE TABLE IF NOT EXISTS admins (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------- Categories -----------
CREATE TABLE IF NOT EXISTS categories (
  id        VARCHAR(36) PRIMARY KEY,
  slug      VARCHAR(64) NOT NULL UNIQUE,
  name_ar   VARCHAR(255) NOT NULL,
  name_en   VARCHAR(255) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------- Products -----------
CREATE TABLE IF NOT EXISTS products (
  id              VARCHAR(36) PRIMARY KEY,
  name_ar         VARCHAR(255) NOT NULL,
  name_en         VARCHAR(255) NOT NULL,
  description_ar  TEXT,
  description_en  TEXT,
  price           DECIMAL(10,3) NOT NULL DEFAULT 0,
  image_url       TEXT,
  category        VARCHAR(64) NOT NULL,
  featured        TINYINT(1) DEFAULT 0,
  in_stock        TINYINT(1) DEFAULT 1,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_featured (featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------- Banners -----------
CREATE TABLE IF NOT EXISTS banners (
  id            VARCHAR(36) PRIMARY KEY,
  title_ar      VARCHAR(255) NOT NULL,
  title_en      VARCHAR(255) NOT NULL,
  subtitle_ar   TEXT,
  subtitle_en   TEXT,
  image_url     TEXT NOT NULL,
  cta_label_ar  VARCHAR(255),
  cta_label_en  VARCHAR(255),
  cta_href      VARCHAR(255),
  active        TINYINT(1) DEFAULT 1,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active (active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------- Orders -----------
CREATE TABLE IF NOT EXISTS orders (
  id              VARCHAR(36) PRIMARY KEY,
  customer_name   VARCHAR(255),
  customer_phone  VARCHAR(64),
  items           JSON NOT NULL,
  total           DECIMAL(10,3) NOT NULL DEFAULT 0,
  lang            VARCHAR(8) DEFAULT 'ar',
  status          VARCHAR(32) DEFAULT 'pending',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

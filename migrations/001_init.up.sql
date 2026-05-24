-- 001_init.up.sql
-- create extensions and base schema (for migration tool compatibility)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- (the rest of schema can be applied via DB init scripts or split into further migrations)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age INT CHECK (age >= 0 AND age <= 200),
  gender VARCHAR(32),
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  engagement_score NUMERIC(6,3) DEFAULT 0.0,
  purchase_frequency NUMERIC(8,3) DEFAULT 0.0,
  session_count INT DEFAULT 0,
  device_type VARCHAR(64),
  meta JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

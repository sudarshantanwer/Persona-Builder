-- 001_init.down.sql
DROP MATERIALIZED VIEW IF EXISTS top_engaged_segments;
DROP TABLE IF EXISTS user_activity_aggregates;
DROP TABLE IF EXISTS campaign_targets;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS brand_personas;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS persona_embeddings;
DROP TABLE IF EXISTS personas;
DROP TABLE IF EXISTS user_segments;
DROP TABLE IF EXISTS segments;
DROP TABLE IF EXISTS users;
-- drop extensions with caution
-- DROP EXTENSION IF EXISTS vector;
-- DROP EXTENSION IF EXISTS pgcrypto;

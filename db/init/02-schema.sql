-- 02-schema.sql

-- USERS
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

-- SEGMENTS
CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_number INT NOT NULL,
  segment_name TEXT NOT NULL,
  summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cluster_number, segment_name)
);

-- USER_SEGMENTS
CREATE TABLE IF NOT EXISTS user_segments (
  user_id UUID NOT NULL,
  segment_id UUID NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, segment_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE CASCADE
);

-- PERSONAS
CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID REFERENCES segments(id) ON DELETE SET NULL,
  persona_name TEXT NOT NULL,
  motivations JSONB,
  pain_points JSONB,
  preferred_channels JSONB,
  buying_behavior TEXT,
  raw_persona JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PERSONA_EMBEDDINGS
CREATE TABLE IF NOT EXISTS persona_embeddings (
  persona_id UUID PRIMARY KEY REFERENCES personas(id) ON DELETE CASCADE,
  embedding VECTOR(1536) NOT NULL,
  embedding_version TEXT DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BRANDS
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name TEXT NOT NULL UNIQUE,
  brand_description TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- BRAND_PERSONAS
CREATE TABLE IF NOT EXISTS brand_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  persona_name TEXT,
  raw_persona JSONB,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  budget NUMERIC(14,2) DEFAULT 0.00,
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  targeting_meta JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CAMPAIGN_TARGETS
CREATE TABLE IF NOT EXISTS campaign_targets (
  campaign_id UUID NOT NULL,
  segment_id UUID NOT NULL,
  similarity_score NUMERIC(8,6) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, segment_id),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE CASCADE
);

-- ANALYTICS
CREATE TABLE IF NOT EXISTS user_activity_aggregates (
  id BIGSERIAL PRIMARY KEY,
  segment_id UUID REFERENCES segments(id),
  date DATE NOT NULL,
  avg_engagement NUMERIC(8,4),
  total_sessions BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MATERIALIZED VIEW
CREATE MATERIALIZED VIEW IF NOT EXISTS top_engaged_segments AS
SELECT s.id AS segment_id, s.segment_name, AVG(u.engagement_score) AS avg_engagement, COUNT(*) AS users
FROM segments s
JOIN user_segments us ON us.segment_id = s.id
JOIN users u ON u.id = us.user_id
GROUP BY s.id, s.segment_name
ORDER BY avg_engagement DESC
WITH NO DATA;

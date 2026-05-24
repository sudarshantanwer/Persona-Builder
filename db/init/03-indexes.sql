-- 03-indexes.sql

CREATE INDEX IF NOT EXISTS idx_users_meta_gin ON users USING GIN (meta);
CREATE INDEX IF NOT EXISTS idx_personas_raw_gin ON personas USING GIN (raw_persona);
CREATE INDEX IF NOT EXISTS idx_brands_meta_gin ON brands USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_campaigns_targeting_meta_gin ON campaigns USING GIN (targeting_meta);

CREATE INDEX IF NOT EXISTS idx_users_engagement ON users (engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at);

CREATE INDEX IF NOT EXISTS idx_persona_embeddings_ivfflat
  ON persona_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 128);

CREATE INDEX IF NOT EXISTS idx_brand_personas_ivfflat
  ON brand_personas
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 64);

CREATE INDEX IF NOT EXISTS idx_personas_motivations_gin ON personas USING GIN (motivations);
CREATE INDEX IF NOT EXISTS idx_campaign_targets_similarity ON campaign_targets (similarity_score DESC);

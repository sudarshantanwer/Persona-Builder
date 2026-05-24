-- 04-seeds.sql

-- Sample users
INSERT INTO users (id, age, gender, interests, engagement_score, purchase_frequency, session_count, device_type)
VALUES
  (gen_random_uuid(), 28, 'female', ARRAY['fitness','running','wellness'], 0.82, 2.0, 45, 'mobile'),
  (gen_random_uuid(), 42, 'male', ARRAY['luxury','travel'], 0.65, 0.5, 12, 'desktop'),
  (gen_random_uuid(), 33, 'non-binary', ARRAY['tech','gaming','mobile'], 0.74, 1.2, 30, 'mobile');

-- Sample segments
INSERT INTO segments (id, cluster_number, segment_name, summary)
VALUES
  (gen_random_uuid(), 1, 'Fitness Enthusiasts', '{"size":12000,"centroid":[0.12,0.34]}'),
  (gen_random_uuid(), 2, 'Luxury Buyers', '{"size":4000,"centroid":[0.55,0.66]}'),
  (gen_random_uuid(), 3, 'Tech-Savvy Mobile Users', '{"size":20000,"centroid":[0.11,0.78]}');

-- Sample personas
INSERT INTO personas (id, segment_id, persona_name, motivations, pain_points, preferred_channels, buying_behavior, raw_persona)
VALUES
  (gen_random_uuid(), (SELECT id FROM segments WHERE segment_name='Fitness Enthusiasts' LIMIT 1), 'Active Amy',
   '{"goals":["health","appearance"]}', '{"time":"lack of time"}', '["instagram","email"]', 'frequent small purchases', '{"llm_prompt":"persona v1"}');

-- NOTE: persona_embeddings is intentionally not seeded here to avoid vector-dimension issues. Add real 1536-dim embeddings via your ingestion pipeline.

-- Sample brand & campaign
INSERT INTO brands (id, brand_name, brand_description)
VALUES (gen_random_uuid(), 'Acme Sports', 'Active lifestyle brand');

INSERT INTO campaigns (id, brand_id, campaign_name, budget, status)
VALUES (gen_random_uuid(), (SELECT id FROM brands WHERE brand_name='Acme Sports' LIMIT 1), 'Summer Push 2026', 50000.00, 'active');

INSERT INTO campaign_targets (campaign_id, segment_id, similarity_score)
VALUES
  ((SELECT id FROM campaigns WHERE campaign_name='Summer Push 2026' LIMIT 1),
   (SELECT id FROM segments WHERE segment_name='Fitness Enthusiasts' LIMIT 1),
   0.93);

#!/bin/bash
set -e

echo "Initializing Persona Builder database..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS vector;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS datasets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id INTEGER REFERENCES users(id),
        filename VARCHAR(255),
        s3_key VARCHAR(512),
        status VARCHAR(50) DEFAULT 'uploaded',
        row_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS clusters (
        id SERIAL PRIMARY KEY,
        dataset_id UUID REFERENCES datasets(id),
        cluster_id INTEGER,
        centroid JSONB,
        size INTEGER,
        summary JSONB,
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS personas (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        dataset_id UUID REFERENCES datasets(id),
        cluster_id INTEGER,
        persona_data JSONB,
        embedding vector(1024),
        confidence_score FLOAT,
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255),
        brand_context TEXT,
        budget DECIMAL,
        channels JSONB,
        matched_personas JSONB,
        status VARCHAR(50) DEFAULT 'draft',
        activated_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
    );

    -- Vector similarity index
    CREATE INDEX IF NOT EXISTS idx_persona_embedding
    ON personas USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

    -- Performance indexes
    CREATE INDEX IF NOT EXISTS idx_datasets_user ON datasets(user_id);
    CREATE INDEX IF NOT EXISTS idx_personas_dataset ON personas(dataset_id);
    CREATE INDEX IF NOT EXISTS idx_campaigns_user ON campaigns(user_id);
EOSQL

echo "Database initialized successfully."

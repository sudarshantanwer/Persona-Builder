import psycopg2
from psycopg2.extras import RealDictCursor, execute_values
from pgvector.psycopg2 import register_vector
from app.config import get_settings

_conn = None

async def init_db():
    global _conn
    settings = get_settings()
    _conn = psycopg2.connect(settings.database_url)
    register_vector(_conn)
    _create_tables()

def _create_tables():
    with _conn.cursor() as cur:
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS datasets (
                id UUID PRIMARY KEY,
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
                id UUID PRIMARY KEY,
                dataset_id UUID REFERENCES datasets(id),
                cluster_id INTEGER,
                persona_data JSONB,
                embedding vector(1024),
                confidence_score FLOAT,
                created_at TIMESTAMP DEFAULT NOW()
            );
            CREATE TABLE IF NOT EXISTS campaigns (
                id UUID PRIMARY KEY,
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
        """)
        # Create vector index for similarity search
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_persona_embedding
            ON personas USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
        """)
        _conn.commit()

def get_conn():
    return _conn

def query(sql, params=None):
    with _conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(sql, params)
        if cur.description:
            return cur.fetchall()
        _conn.commit()
        return None

def execute(sql, params=None):
    with _conn.cursor() as cur:
        cur.execute(sql, params)
        _conn.commit()

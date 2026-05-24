from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str = "postgresql://persona_user:persona_pass@localhost:5432/persona_builder"
    redis_url: str = "redis://localhost:6379"
    aws_region: str = "us-east-1"
    s3_bucket: str = "persona-builder-datasets"
    bedrock_model_id: str = "anthropic.claude-3-sonnet-20240229-v1:0"

    class Config:
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    return Settings()

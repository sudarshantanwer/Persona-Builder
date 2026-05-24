import numpy as np
from app.services.database import query, get_conn
from app.services.bedrock import generate_embedding
import logging

logger = logging.getLogger(__name__)


async def match_brand_to_personas(brand_context: str, top_k: int = 5) -> dict:
    """Match brand context against stored persona embeddings using cosine similarity."""
    brand_embedding = await generate_embedding(brand_context)

    # Use PGVector's cosine distance operator for efficient similarity search
    results = query(
        """
        SELECT id, dataset_id, cluster_id, persona_data, confidence_score,
               1 - (embedding <=> %s::vector) AS similarity
        FROM personas
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> %s::vector
        LIMIT %s
        """,
        [brand_embedding, brand_embedding, top_k]
    )

    matches = []
    for row in results:
        matches.append({
            "persona_id": str(row["id"]),
            "dataset_id": str(row["dataset_id"]),
            "cluster_id": row["cluster_id"],
            "persona": row["persona_data"],
            "similarity_score": round(float(row["similarity"]), 4),
            "confidence": row["confidence_score"],
        })

    return {
        "matches": matches,
        "total_personas_searched": _get_persona_count(),
        "brand_context": brand_context,
    }


def _get_persona_count() -> int:
    result = query("SELECT COUNT(*) as count FROM personas WHERE embedding IS NOT NULL")
    return result[0]["count"] if result else 0

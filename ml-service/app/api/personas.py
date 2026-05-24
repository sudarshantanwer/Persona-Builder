import io
import json
import uuid
import pandas as pd
import boto3
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from app.config import get_settings
from app.services.clustering import DataProcessor, ClusteringService
from app.services.bedrock import generate_persona, generate_persona_embedding
from app.services.matching import match_brand_to_personas
from app.services.database import execute, query

router = APIRouter()
settings = get_settings()
s3 = boto3.client("s3", region_name=settings.aws_region)


class GenerateRequest(BaseModel):
    dataset_id: str
    k: int = 5


class MatchRequest(BaseModel):
    brand_context: str
    top_k: int = 5


@router.post("/generate")
async def generate_personas(req: GenerateRequest, background_tasks: BackgroundTasks):
    dataset = query("SELECT * FROM datasets WHERE id = %s", [req.dataset_id])
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    background_tasks.add_task(_persona_pipeline, req.dataset_id, req.k)
    return {"status": "generating", "dataset_id": req.dataset_id, "k": req.k}


async def _persona_pipeline(dataset_id: str, k: int):
    """Full pipeline: load data → cluster → generate personas → embed → store."""
    try:
        # Load dataset from S3
        dataset = query("SELECT s3_key FROM datasets WHERE id = %s", [dataset_id])
        obj = s3.get_object(Bucket=settings.s3_bucket, Key=dataset[0]["s3_key"])
        df = pd.read_csv(io.BytesIO(obj["Body"].read()))

        # Process and cluster
        processor = DataProcessor()
        df_processed = processor.process(df)
        clustering = ClusteringService()
        result = clustering.cluster(df_processed, k)

        # For each cluster: generate persona via LLM, embed, store
        for cluster in result["clusters"]:
            persona_id = str(uuid.uuid4())
            persona_data = await generate_persona(cluster["summary"])
            embedding = await generate_persona_embedding(persona_data)

            # Store cluster
            execute(
                "INSERT INTO clusters (dataset_id, cluster_id, centroid, size, summary) VALUES (%s, %s, %s, %s, %s)",
                [dataset_id, cluster["cluster_id"], json.dumps(cluster["centroid"]),
                 cluster["size"], json.dumps(cluster["summary"])]
            )

            # Store persona with embedding
            execute(
                "INSERT INTO personas (id, dataset_id, cluster_id, persona_data, embedding, confidence_score) VALUES (%s, %s, %s, %s, %s, %s)",
                [persona_id, dataset_id, cluster["cluster_id"],
                 json.dumps(persona_data), embedding, result["silhouette_score"]]
            )

        execute("UPDATE datasets SET status = 'completed' WHERE id = %s", [dataset_id])
    except Exception as e:
        execute("UPDATE datasets SET status = 'failed' WHERE id = %s", [dataset_id])
        raise


@router.post("/match")
async def match_personas(req: MatchRequest):
    result = await match_brand_to_personas(req.brand_context, req.top_k)
    return result


@router.get("/dataset/{dataset_id}")
async def list_personas(dataset_id: str):
    results = query(
        "SELECT id, cluster_id, persona_data, confidence_score, created_at FROM personas WHERE dataset_id = %s ORDER BY cluster_id",
        [dataset_id]
    )
    return {"personas": results}

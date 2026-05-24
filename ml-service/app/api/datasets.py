import io
import pandas as pd
import boto3
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from app.config import get_settings
from app.services.clustering import DataProcessor, ClusteringService
from app.services.database import execute, query

router = APIRouter()
settings = get_settings()
s3 = boto3.client("s3", region_name=settings.aws_region)


class ProcessRequest(BaseModel):
    dataset_id: str
    s3_key: str
    s3_bucket: str


@router.post("/process")
async def process_dataset(req: ProcessRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(_process_pipeline, req.dataset_id, req.s3_key, req.s3_bucket)
    return {"status": "processing", "dataset_id": req.dataset_id}


async def _process_pipeline(dataset_id: str, s3_key: str, s3_bucket: str):
    try:
        # Download from S3
        obj = s3.get_object(Bucket=s3_bucket, Key=s3_key)
        df = pd.read_csv(io.BytesIO(obj["Body"].read()))

        # Preprocess
        processor = DataProcessor()
        df_processed = processor.process(df)

        # Update status
        execute(
            "UPDATE datasets SET status = 'processed', row_count = %s WHERE id = %s",
            [len(df), dataset_id]
        )
    except Exception as e:
        execute("UPDATE datasets SET status = 'failed' WHERE id = %s", [dataset_id])
        raise


@router.get("/{dataset_id}/stats")
async def dataset_stats(dataset_id: str):
    result = query("SELECT * FROM datasets WHERE id = %s", [dataset_id])
    if not result:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return result[0]

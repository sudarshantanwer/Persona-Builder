import json
import logging
import boto3
import numpy as np
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

bedrock = boto3.client("bedrock-runtime", region_name=settings.aws_region)

PERSONA_PROMPT_TEMPLATE = """You are an expert marketing strategist. Based on the audience cluster data below, generate a detailed marketing persona.

<audience_context>
{context}
</audience_context>

Generate a JSON response with EXACTLY this schema:
{{
  "persona_name": "string - creative persona name",
  "age_group": "string",
  "motivations": ["list of 3-5 motivations"],
  "pain_points": ["list of 3-5 pain points"],
  "interests": ["list of 5-8 interests"],
  "preferred_channels": ["list of channels"],
  "buying_behavior": "string description",
  "engagement_pattern": "string description",
  "marketing_recommendations": ["list of 3-5 actionable recommendations"]
}}

IMPORTANT: Return ONLY valid JSON. No explanations or markdown."""


async def generate_persona(cluster_summary: dict) -> dict:
    context = json.dumps(cluster_summary, indent=2)
    prompt = PERSONA_PROMPT_TEMPLATE.format(context=context)

    response = bedrock.invoke_model(
        modelId=settings.bedrock_model_id,
        contentType="application/json",
        accept="application/json",
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "temperature": 0.2,
            "messages": [{"role": "user", "content": prompt}],
        }),
    )

    result = json.loads(response["body"].read())
    text = result["content"][0]["text"]

    # Parse and validate JSON response
    persona = json.loads(text)
    _validate_persona(persona)
    return persona


def _validate_persona(persona: dict):
    required = ["persona_name", "motivations", "pain_points", "interests", "preferred_channels", "buying_behavior"]
    missing = [k for k in required if k not in persona]
    if missing:
        raise ValueError(f"Persona missing fields: {missing}")


async def generate_embedding(text: str) -> list[float]:
    """Generate embedding using Bedrock Titan Embeddings."""
    response = bedrock.invoke_model(
        modelId="amazon.titan-embed-text-v2:0",
        contentType="application/json",
        accept="application/json",
        body=json.dumps({"inputText": text, "dimensions": 1024}),
    )
    result = json.loads(response["body"].read())
    return result["embedding"]


async def generate_persona_embedding(persona: dict) -> list[float]:
    """Convert persona to text representation and generate embedding."""
    text = (
        f"Persona: {persona.get('persona_name', '')}. "
        f"Interests: {', '.join(persona.get('interests', []))}. "
        f"Motivations: {', '.join(persona.get('motivations', []))}. "
        f"Buying behavior: {persona.get('buying_behavior', '')}. "
        f"Channels: {', '.join(persona.get('preferred_channels', []))}."
    )
    return await generate_embedding(text)

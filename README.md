# Persona Builder

Enterprise AI-powered marketing intelligence platform for generating audience personas and semantic campaign targeting.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   React UI  │────▶│  Node.js API │────▶│ FastAPI ML Svc│
│  (Tailwind) │     │ (Express.js) │     │  (Python)     │
└─────────────┘     └──────┬───────┘     └───────┬───────┘
                           │                      │
                    ┌──────┴───────┐       ┌──────┴───────┐
                    │  PostgreSQL  │       │  AWS Bedrock  │
                    │  + PGVector  │       │  Claude 3     │
                    └──────────────┘       └──────────────┘
                           │
                    ┌──────┴───────┐
                    │    Redis     │
                    └──────────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React + Redux + Tailwind dashboard |
| Backend | 4000 | Node.js orchestration layer |
| ML Service | 8000 | Python FastAPI ML/AI pipeline |
| PostgreSQL | 5432 | Primary database + PGVector |
| Redis | 6379 | Caching layer |

## Quick Start

```bash
docker-compose up --build
```

## Tech Stack

- **Frontend**: React.js, Redux Toolkit, Tailwind CSS
- **Backend**: Node.js, Express.js
- **ML/AI**: Python, FastAPI, scikit-learn, AWS Bedrock (Claude 3 Sonnet)
- **Database**: PostgreSQL + PGVector
- **Cache**: Redis
- **Infra**: Docker, AWS ECS/Fargate, S3, CloudWatch
- **CI/CD**: GitHub Actions

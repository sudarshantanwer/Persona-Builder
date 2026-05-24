require('dotenv').config();

module.exports = {
  port: process.env.PORT || 4000,
  env: process.env.NODE_ENV || 'development',
  db: {
    connectionString: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  aws: {
    region: process.env.AWS_REGION,
    s3Bucket: process.env.S3_BUCKET,
    bedrockModelId: process.env.BEDROCK_MODEL_ID,
  },
  mlService: {
    url: process.env.ML_SERVICE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiry: process.env.JWT_EXPIRY,
  },
};

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const config = require('../config');
const db = require('../config/database');
const logger = require('../config/logger');

const s3 = new S3Client({ region: config.aws.region });

class DatasetService {
  async upload(file, userId) {
    const datasetId = uuidv4();
    const s3Key = `datasets/${userId}/${datasetId}/${file.originalname}`;

    await s3.send(new PutObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    await db.query(
      `INSERT INTO datasets (id, user_id, filename, s3_key, status, row_count)
       VALUES ($1, $2, $3, $4, 'uploaded', 0)`,
      [datasetId, userId, file.originalname, s3Key]
    );

    // Trigger async processing
    this.triggerProcessing(datasetId, s3Key);

    return { datasetId, status: 'uploaded', s3Key };
  }

  async triggerProcessing(datasetId, s3Key) {
    try {
      await axios.post(`${config.mlService.url}/api/v1/datasets/process`, {
        dataset_id: datasetId,
        s3_key: s3Key,
        s3_bucket: config.aws.s3Bucket,
      });
      await db.query(`UPDATE datasets SET status = 'processing' WHERE id = $1`, [datasetId]);
    } catch (err) {
      logger.error(`Failed to trigger processing for ${datasetId}`, err);
      await db.query(`UPDATE datasets SET status = 'failed' WHERE id = $1`, [datasetId]);
    }
  }

  async getStatus(datasetId) {
    const { rows } = await db.query(`SELECT id, status, row_count, created_at FROM datasets WHERE id = $1`, [datasetId]);
    return rows[0];
  }

  async listByUser(userId) {
    const { rows } = await db.query(
      `SELECT id, filename, status, row_count, created_at FROM datasets WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = new DatasetService();

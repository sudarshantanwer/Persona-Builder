const axios = require('axios');
const config = require('../config');
const db = require('../config/database');
const { redis } = require('../config/redis');
const logger = require('../config/logger');

class PersonaService {
  async generate(datasetId, options = {}) {
    const { k = 5 } = options;

    // Trigger clustering + persona generation in ML service
    const { data } = await axios.post(`${config.mlService.url}/api/v1/personas/generate`, {
      dataset_id: datasetId,
      k,
    });

    return data;
  }

  async getById(personaId) {
    const cacheKey = `persona:${personaId}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const { rows } = await db.query(
      `SELECT id, dataset_id, cluster_id, persona_data, confidence_score, created_at
       FROM personas WHERE id = $1`,
      [personaId]
    );

    if (rows[0]) {
      await redis.setEx(cacheKey, 3600, JSON.stringify(rows[0]));
    }
    return rows[0];
  }

  async listByDataset(datasetId) {
    const { rows } = await db.query(
      `SELECT id, cluster_id, persona_data, confidence_score, created_at
       FROM personas WHERE dataset_id = $1 ORDER BY cluster_id`,
      [datasetId]
    );
    return rows;
  }

  async matchBrand(brandContext) {
    const { data } = await axios.post(`${config.mlService.url}/api/v1/personas/match`, {
      brand_context: brandContext,
    });
    return data;
  }
}

module.exports = new PersonaService();

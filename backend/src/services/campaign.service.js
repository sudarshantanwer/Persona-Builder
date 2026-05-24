const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { redis } = require('../config/redis');
const personaService = require('./persona.service');

class CampaignService {
  async create(userId, campaignData) {
    const { name, brand_context, budget, channels } = campaignData;
    const id = uuidv4();

    // Match brand to audience personas
    const matchResult = await personaService.matchBrand(brand_context);

    await db.query(
      `INSERT INTO campaigns (id, user_id, name, brand_context, budget, channels, matched_personas, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')`,
      [id, userId, name, brand_context, budget, channels, JSON.stringify(matchResult.matches)]
    );

    return { id, name, matches: matchResult.matches, status: 'draft' };
  }

  async activate(campaignId) {
    await db.query(`UPDATE campaigns SET status = 'active', activated_at = NOW() WHERE id = $1`, [campaignId]);
    await redis.del(`campaign:${campaignId}`);
    return { campaignId, status: 'active' };
  }

  async getById(campaignId) {
    const cacheKey = `campaign:${campaignId}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const { rows } = await db.query(`SELECT * FROM campaigns WHERE id = $1`, [campaignId]);
    if (rows[0]) await redis.setEx(cacheKey, 1800, JSON.stringify(rows[0]));
    return rows[0];
  }

  async listByUser(userId) {
    const { rows } = await db.query(
      `SELECT id, name, status, budget, created_at FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  }
}

module.exports = new CampaignService();

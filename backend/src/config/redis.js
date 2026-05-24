const { createClient } = require('redis');
const config = require('./index');
const logger = require('./logger');

const redis = createClient({ url: config.redis.url });

redis.on('error', (err) => logger.error('Redis error', err));
redis.on('connect', () => logger.info('Redis connected'));

const connect = async () => {
  await redis.connect();
};

module.exports = { redis, connect };

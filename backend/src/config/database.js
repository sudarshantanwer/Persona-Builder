const { Pool } = require('pg');
const config = require('./index');
const logger = require('./logger');

// Use DATABASE_URL if provided, otherwise fall back to config
const connectionString = process.env.DATABASE_URL || (config && config.db && config.db.connectionString);

const pool = new Pool({
  connectionString,
  max: parseInt(process.env.PG_POOL_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT || '2000', 10),
  // Enable SSL when PG_SSL=true (useful for production / cloud DBs)
  ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: process.env.PG_SSL_REJECT_UNAUTHORIZED !== 'false' } : undefined,
});

pool.on('error', (err) => {
  logger.error('Unexpected database error', err);
});

// Simple query wrapper
function query(text, params) {
  return pool.query(text, params);
}

// Transaction helper: accepts an async callback that receives a client
async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) { logger.error('Rollback failed', e); }
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  query,
  pool,
  withTransaction,
};

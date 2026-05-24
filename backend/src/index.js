const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const logger = require('./config/logger');
const { connect: connectRedis } = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');

const datasetRoutes = require('./routes/dataset.routes');
const personaRoutes = require('./routes/persona.routes');
const campaignRoutes = require('./routes/campaign.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Security & parsing
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/personas', personaRoutes);
app.use('/api/campaigns', campaignRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'healthy', timestamp: new Date().toISOString() }));

// Error handler
app.use(errorHandler);

const start = async () => {
  try {
    await connectRedis();
    app.listen(config.port, () => {
      logger.info(`Backend running on port ${config.port}`);
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
};

start();

module.exports = app;

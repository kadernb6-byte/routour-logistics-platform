// ============================================
// ROUTEUR LOGISTICS - API Entry Point
// ============================================
// This is the main file that starts the Express server.
// It loads environment variables, applies middleware,
// mounts routes, and starts listening for requests.

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const { pool, testConnection } = require('./config/db');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// --------------- Security Middleware ---------------
// helmet: sets various HTTP headers for security
app.use(helmet());

// cors: allows requests from the frontend origin
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

// rate limiter: prevents brute-force / DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per window per IP
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// --------------- Body Parsing ---------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --------------- Logging ---------------
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// --------------- Health Check ---------------
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// --------------- Static Files (uploads) ---------------
const path = require('path');
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// --------------- API Routes ---------------
app.use(env.API_PREFIX, routes);

// --------------- Error Handling ---------------
app.use(notFound);
app.use(errorHandler);

// --------------- Start Server ---------------
const startServer = async () => {
  try {
    // Test database connection on startup
    await testConnection();

    app.listen(env.PORT, () => {
      console.log(`\n🚀 Routeur Logistics API`);
      console.log(`   Environment : ${env.NODE_ENV}`);
      console.log(`   Port        : ${env.PORT}`);
      console.log(`   API URL     : http://localhost:${env.PORT}${env.API_PREFIX}`);
      console.log(`   Health      : http://localhost:${env.PORT}/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app; // Export for testing

// ============================================
// PostgreSQL Database Connection
// ============================================
// Uses the 'pg' library's Pool for connection pooling.
// A pool reuses connections instead of creating a new one
// for every query — critical for production performance.

const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    // Pool configuration
    max: 20,                    // Max number of connections
    idleTimeoutMillis: 30000,   // Close idle connections after 30s
    connectionTimeoutMillis: 5000, // Timeout if connection takes > 5s
});

// Log pool errors (don't crash the app)
pool.on('error', (err) => {
    console.error('❌ Unexpected database pool error:', err.message);
});

/**
 * Test the database connection.
 * Called once on server startup.
 */
const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Database connected:', result.rows[0].now);
    } catch (error) {
        console.warn('⚠️  Database connection failed:', error.message);
        console.warn('   The API will start, but database features won\'t work.');
        console.warn('   Make sure PostgreSQL is running and .env is configured.\n');
    }
};

/**
 * Helper: run a query with parameters.
 * Usage: const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
 */
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query, testConnection };

// ============================================
// Database Seed Runner
// ============================================
// Inserts sample data for development and testing.
// Run with: npm run db:seed

const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const runSeed = async () => {
    const seedFile = path.resolve(__dirname, '../../../database/seed.sql');

    try {
        if (!fs.existsSync(seedFile)) {
            console.log('No seed.sql file found. Skipping.');
            process.exit(0);
        }

        const sql = fs.readFileSync(seedFile, 'utf-8');

        console.log('\n🌱 Running database seed...\n');
        await pool.query(sql);
        console.log('✅ Seed data inserted successfully.\n');
    } catch (error) {
        console.error('\n❌ Seed failed:', error.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
};

runSeed();

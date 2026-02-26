// ============================================
// Database Setup Script
// ============================================
// Creates the routeur_logistics database if it doesn't exist,
// then runs the initial migration and seed.
// Run with: node backend/src/config/setup-db.js

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const env = require('./env');

async function setupDatabase() {
    // Step 1: Connect to the default 'postgres' database to create our DB
    const adminClient = new Client({
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: 'postgres', // connect to default DB first
    });

    try {
        await adminClient.connect();
        console.log('✅ Connected to PostgreSQL server');

        // Check if our database exists
        const result = await adminClient.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [env.DB_NAME]
        );

        if (result.rows.length === 0) {
            // Create the database
            await adminClient.query(`CREATE DATABASE ${env.DB_NAME}`);
            console.log(`✅ Database "${env.DB_NAME}" created`);
        } else {
            console.log(`ℹ️  Database "${env.DB_NAME}" already exists`);
        }
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        process.exit(1);
    } finally {
        await adminClient.end();
    }

    // Step 2: Connect to our database and run migration
    const appClient = new Client({
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
    });

    try {
        await appClient.connect();
        console.log(`✅ Connected to "${env.DB_NAME}"`);

        // Run migration
        const migrationPath = path.resolve(__dirname, '../../../database/migrations/001_initial_schema.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
        await appClient.query(migrationSQL);
        console.log('✅ Migration 001_initial_schema.sql applied');

        // Run seed
        const seedPath = path.resolve(__dirname, '../../../database/seed.sql');
        const seedSQL = fs.readFileSync(seedPath, 'utf-8');
        await appClient.query(seedSQL);
        console.log('✅ Seed data inserted');

        console.log('\n🎉 Database setup complete! You can now run the app.\n');
    } catch (error) {
        console.error('❌ Error running migrations/seed:', error.message);
    } finally {
        await appClient.end();
        process.exit(0);
    }
}

setupDatabase();

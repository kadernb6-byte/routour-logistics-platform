// ============================================
// Database Migration Runner
// ============================================
// Reads and executes .sql files from the /database/migrations folder.
// Run with: npm run db:migrate

const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const runMigrations = async () => {
    const migrationsDir = path.resolve(__dirname, '../../../database/migrations');

    try {
        // Read all .sql files, sorted by name
        const files = fs.readdirSync(migrationsDir)
            .filter((f) => f.endsWith('.sql'))
            .sort();

        if (files.length === 0) {
            console.log('No migration files found.');
            process.exit(0);
        }

        console.log(`\n📦 Running ${files.length} migration(s)...\n`);

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf-8');

            console.log(`  ▸ ${file}`);
            await pool.query(sql);
        }

        console.log('\n✅ All migrations completed successfully.\n');
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error);
    } finally {
        await pool.end();
        process.exit(0);
    }
};

runMigrations();

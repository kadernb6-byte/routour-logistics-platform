// ============================================
// Database Migration Runner (Supabase)
// ============================================
// Reads and executes .sql files via Supabase RPC.
// Note: For Supabase, it's recommended to run migrations
// directly in the SQL Editor. This script is kept for
// completeness but may not work with complex DDL.
// Run with: npm run db:migrate

const fs = require('fs');
const path = require('path');
const { supabase } = require('./db');

const runMigrations = async () => {
    const migrationsDir = path.resolve(__dirname, '../../../database/migrations');

    try {
        const files = fs.readdirSync(migrationsDir)
            .filter((f) => f.endsWith('.sql'))
            .sort();

        if (files.length === 0) {
            console.log('No migration files found.');
            process.exit(0);
        }

        console.log(`\n📦 Running ${files.length} migration(s) via Supabase...\n`);
        console.log('⚠️  Note: Complex DDL may need to be run directly in Supabase SQL Editor.\n');

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf-8');

            console.log(`  ▸ ${file}`);
            const { error } = await supabase.rpc('exec_sql', { sql_text: sql });
            if (error) {
                console.warn(`    ⚠️  ${error.message} (try running in Supabase SQL Editor)`);
            }
        }

        console.log('\n✅ Migration attempt completed.\n');
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
    } finally {
        process.exit(0);
    }
};

runMigrations();

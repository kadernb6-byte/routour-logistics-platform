// ============================================
// Database Seed Runner (Supabase)
// ============================================
// Note: For Supabase, run seed.sql directly in the SQL Editor.
// This script is kept for reference.
// Run with: npm run db:seed

const fs = require('fs');
const path = require('path');
const { supabase } = require('./db');

const runSeed = async () => {
    const seedFile = path.resolve(__dirname, '../../../database/seed.sql');

    try {
        if (!fs.existsSync(seedFile)) {
            console.log('No seed.sql file found. Skipping.');
            process.exit(0);
        }

        const sql = fs.readFileSync(seedFile, 'utf-8');

        console.log('\n🌱 Running database seed via Supabase...\n');
        console.log('⚠️  Note: If this fails, run seed.sql directly in Supabase SQL Editor.\n');

        const { error } = await supabase.rpc('exec_sql', { sql_text: sql });
        if (error) {
            console.warn('⚠️  ', error.message);
            console.log('→ Please run seed.sql in the Supabase SQL Editor instead.');
        } else {
            console.log('✅ Seed data inserted successfully.\n');
        }
    } catch (error) {
        console.error('\n❌ Seed failed:', error.message);
    } finally {
        process.exit(0);
    }
};

runSeed();

// ============================================
// Supabase Client Configuration
// ============================================
// Uses the Supabase JS client to connect via REST API (HTTPS).
// This replaces the old pg Pool connection.

const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

/**
 * Test the Supabase connection.
 * Called once on server startup.
 */
const testConnection = async () => {
    try {
        const { data, error } = await supabase.from('companies').select('id').limit(1);
        if (error) throw error;
        console.log('✅ Supabase connected via REST API');
    } catch (error) {
        console.warn('⚠️  Supabase connection test failed:', error.message);
        console.warn('   The API will start, but database features may not work.');
        console.warn('   Make sure tables exist and .env is configured.\n');
    }
};

module.exports = { supabase, testConnection };

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const envConfig = {};
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            envConfig[match[1]] = value.trim();
        }
    });
}

const supabaseUrl = envConfig.SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('--- DIAGNOSING SUPABASE watch_history ---');
    
    // Let's get an existing record to find a valid user_id
    const { data: existingRows, error: fetchErr } = await supabaseAdmin
        .from('watch_history')
        .select('*')
        .limit(1);

    if (fetchErr) {
        console.error('Error fetching watch_history:', fetchErr);
        return;
    }

    console.log('Existing record:', existingRows);
    
    // If we have an existing row, let's use its user_id, otherwise use a placeholder uuid
    const testUserId = existingRows && existingRows.length > 0 
        ? existingRows[0].user_id 
        : 'f8b8c15c-d026-4d8e-b6bc-673f850a4b93';

    console.log(`Using user_id: ${testUserId} for testing upsert.`);

    // Test upsert with admin client (bypasses RLS)
    console.log('\nTesting upsert via admin client...');
    const { data: upsertData, error: upsertErr } = await supabaseAdmin
        .from('watch_history')
        .upsert(
            {
                user_id: testUserId,
                movie_id: 999999, // dummy movie ID
                watched_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,movie_id' }
        )
        .select();

    if (upsertErr) {
        console.error('❌ Upsert FAILED with Admin Client:', upsertErr);
    } else {
        console.log('✅ Upsert SUCCEEDED with Admin Client:', upsertData);
        
        // Clean up the dummy row
        const { error: deleteErr } = await supabaseAdmin
            .from('watch_history')
            .delete()
            .eq('user_id', testUserId)
            .eq('movie_id', 999999);
        if (deleteErr) {
            console.error('Error cleaning up dummy row:', deleteErr);
        } else {
            console.log('Cleaned up dummy row.');
        }
    }
}

run();

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
    console.log('1. Testing simple select from listings...');
    const { data: selectData, error: selectError } = await supabase
        .from('listings')
        .select('id')
        .limit(1);

    if (selectError) {
        console.error('Select failed:', selectError.message);
    } else {
        console.log('Select succeeded. Data:', selectData);
    }

    console.log('\n2. Testing insert into listings (simulating the form, EXPECTED TO FAIL OR HANG DUE TO RLS)...');

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Insert timed out after 5 seconds! This confirms the hang.')), 5000)
    );

    const insertPromise = supabase
        .from('listings')
        .insert({
            user_id: '00000000-0000-0000-0000-000000000000', // Fake ID
            title: 'Script Test',
            category: 'Dijital',
            type: 'offer',
            duration_hrs: 1,
            description: 'Test description',
            tags: ['test'],
            status: 'active'
        })
        .select();

    try {
        const { data: insertData, error: insertError } = await Promise.race([insertPromise, timeoutPromise]);

        if (insertError) {
            console.error('Insert returned an error (Good, this means it didnt hang):', insertError.message);
        } else {
            console.log('Insert succeeded (Unexpected!):', insertData);
        }
    } catch (err) {
        console.error('Insert Exception:', err.message);
    }

    process.exit(0);
}

testSupabase();

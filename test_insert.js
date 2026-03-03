// Script to test raw insert and see postgres error directly
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
    console.log('Testing insert with anon key...');
    const { data, error } = await supabase.from('listings').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        title: 'Test',
        description: 'Test',
        category: 'Diğer',
        type: 'offer',
        duration_hrs: 1,
        tags: [],
        status: 'active'
    });
    console.log('Result:', error || data);
    process.exit(0);
}
check();

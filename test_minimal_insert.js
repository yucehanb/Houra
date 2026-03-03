require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Veritabanı URL'sindeki anon_key ile değil, varsa SERVICE_ROLE_KEY ile test edeceğiz
// veya query'yi loglayacağız. Anon key yoksa service key dene.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDeadlocks() {
    console.log('1. Checking for active locks in Postgres...');
    // This requires raw SQL execution which is not possible via standard supabase-js client
    // without a stored procedure, but we can try calling an RPC if one exists.

    console.log('2. Trying a direct minimal insert with no optional fields...');
    // What if the user ID doesn't exist in the users table? 
    // Let's first fetch a completely valid user ID from the users table.
    const { data: users, error: usersErr } = await supabase.from('users').select('id').limit(1);
    if (usersErr || !users || users.length === 0) {
        console.error('Failed to get a valid user ID:', usersErr || 'No users found');
        return;
    }

    const validUserId = users[0].id;
    console.log('Found valid user ID:', validUserId);

    const payload = {
        user_id: validUserId,
        title: 'Minimal Test Insert',
        category: 'Diğer',
        type: 'offer',
        duration_hrs: 1,
        status: 'active'
    };

    console.log('Sending payload:', payload);

    const start = Date.now();
    const { data, error } = await supabase.from('listings').insert([payload]);
    const end = Date.now();

    console.log(`Query finished in ${end - start}ms`);

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Insert Success:', data);
    }
}

checkDeadlocks();

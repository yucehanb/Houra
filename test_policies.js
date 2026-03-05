require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Veritabanı URL'sindeki anon_key ile değil, SERVICE_ROLE_KEY ile test edeceğiz
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
    try {
        console.log("Checking policies for conversations and messages...");
        const { data, error } = await supabase.rpc('get_policies', {})
        if (error) {
            console.log("RPC get_policies not found. Falling back to direct query on pg_policies via pg_meta or standard api if reachable... (wait, we can't do this easily from rest). Let's just create a test script to act as the seller.");
            return;
        }
        console.log(data);
    } catch (e) {
        console.error(e);
    }
}
checkPolicies();

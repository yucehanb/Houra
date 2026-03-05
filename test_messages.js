require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMessages() {
    const { data: convs, error: convErr } = await supabase.from('conversations').select('*').limit(5);
    console.log("Conversations:", convs, convErr);

    if (convs && convs.length > 0) {
        const { data: msgs, error: msgErr } = await supabase.from('messages').select('*').eq('conversation_id', convs[0].id).limit(5);
        console.log("Messages for First Conv:", msgs, msgErr);
    }
}

checkMessages();

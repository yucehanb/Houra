require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSellerInbox() {
    const { data: convs, error: convErr } = await supabase.from('conversations').select('*');
    if (convErr) {
        console.error(convErr);
        return;
    }

    console.log(`Found ${convs.length} total conversations in DB:`);
    convs.forEach(c => {
        console.log(`[Conv ${c.id}] Listing: ${c.listing_id}, Buyer: ${c.buyer_id}, Seller: ${c.seller_id}`);
    });
}
testSellerInbox();

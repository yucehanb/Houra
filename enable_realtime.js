require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function enableRealtime() {
    console.log("Checking if we can enable realtime...");

    // We can't run pure DDL using the JS client without an RPC, so we will create a SQL script 
    // for the user to run in their Supabase console.
    console.log("Run this in Supabase SQL editor:");
    console.log(`
BEGIN;
  -- Remove tables from the publication first just in case
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS messages;
  ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS conversations;
  
  -- Add them back to enable realtime events
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
COMMIT;
    `);
}

enableRealtime();

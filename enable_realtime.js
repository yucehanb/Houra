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
  -- Note: If you get an 'already exists' error, you can safely ignore it.
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  ALTER PUBLICATION supabase_realtime ADD TABLE listings;
COMMIT;
    `);
}

enableRealtime();

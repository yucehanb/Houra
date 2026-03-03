const https = require('https');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
let url = '';
let key = '';
envFile.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        url = line.substring(line.indexOf('=') + 1).trim();
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        key = line.substring(line.indexOf('=') + 1).trim();
    }
});

const reqUrl = new URL(`${url}/rest/v1/listings`);
const options = {
    hostname: reqUrl.hostname,
    path: reqUrl.pathname,
    method: 'POST',
    headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
};

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => { console.log('RESPONSE:', data); });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.write(JSON.stringify({
    user_id: '00000000-0000-0000-0000-000000000000',
    title: 'Test Hang',
    description: 'Testing if this hangs',
    category: 'Dijital',
    type: 'offer',
    duration_hrs: 1,
    tags: [],
    status: 'active',
    view_count: 0
}));

console.log('Sending request...');
req.end();

setTimeout(() => {
    console.log('\nTIMEOUT: Script took more than 10 seconds.');
    process.exit(1);
}, 10000);

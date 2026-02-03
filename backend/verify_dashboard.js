
import http from 'http';

// 1. Login to get token
const loginBody = JSON.stringify({
    email: "wh002@gmail.com",
    password: "password"
});

const loginOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginBody.length,
        'Origin': 'http://localhost:5173'
    }
};

console.log("Logging in as wh002...");
const req = http.request(loginOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            const token = JSON.parse(data).token;
            console.log("✅ Login successful. Token received.");
            fetchDashboard(token);
        } else {
            console.error("❌ Login failed:", data);
        }
    });
});

req.write(loginBody);
req.end();

// 2. Fetch Dashboard
function fetchDashboard(token) {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/grievance/warehouse/dashboard',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Origin': 'http://localhost:5173'
        }
    };

    console.log("Fetching Warehouse Dashboard...");
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log(`STATUS: ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log("✅ Dashboard load successful!");
                try {
                    const json = JSON.parse(data);
                    console.log(`Received ${json.complaints ? json.complaints.length : 0} complaints.`);
                } catch (e) {
                    console.log("Body:", data);
                }
            } else {
                console.log("❌ Dashboard failed:", data);
            }
        });
    });
    req.end();
}

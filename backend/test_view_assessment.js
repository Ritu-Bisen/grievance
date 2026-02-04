
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
            console.log("✅ Login successful.");
            viewAssessment(token);
        } else {
            console.error("❌ Login failed:", data);
        }
    });
});

req.write(loginBody);
req.end();

// 2. View Assessment
function viewAssessment(token) {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/grievance/warehouse/assessment/view/CMP-2F4768B0',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Origin': 'http://localhost:5173'
        }
    };

    console.log("Requesting Assessment View...");
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log(`STATUS: ${res.statusCode}`);
            try {
                const json = JSON.parse(data);
                console.log("RESPONSE:", JSON.stringify(json, null, 2));
            } catch (e) {
                console.log("BODY:", data);
            }
        });
    });
    req.end();
}

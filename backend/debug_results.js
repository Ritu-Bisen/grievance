import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

async function run() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [complaints] = await db.query('SELECT complaint_code, status FROM complaints ORDER BY created_at DESC LIMIT 10');

    let result = { complaints };

    for (const c of complaints) {
        const [qc] = await db.query('SELECT * FROM qc_assessments WHERE complaint_code = ?', [c.complaint_code]);
        const [reports] = await db.query('SELECT * FROM complaint_reports WHERE complaint_code = ?', [c.complaint_code]);
        result[c.complaint_code] = {
            status: c.status,
            qc: qc[0] || null,
            report: reports[0] || null
        };
    }

    fs.writeFileSync('debug_results.json', JSON.stringify(result, null, 2));
    await db.end();
    console.log('Results written to debug_results.json');
}

run().catch(console.error);

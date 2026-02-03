import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [complaints] = await db.query('SELECT complaint_code, status FROM complaints ORDER BY created_at DESC LIMIT 5');
    console.log('--- Latest Complaints ---');
    console.log(complaints);

    for (const c of complaints) {
        const [qc] = await db.query('SELECT * FROM qc_assessments WHERE complaint_code = ?', [c.complaint_code]);
        const [reports] = await db.query('SELECT * FROM complaint_reports WHERE complaint_code = ?', [c.complaint_code]);
        console.log(`\nCode: ${c.complaint_code}`);
        console.log('QC:', qc[0] || 'NONE');
        console.log('Report:', reports[0] || 'NONE');
    }

    await db.end();
}

run().catch(console.error);

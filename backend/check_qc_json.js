import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: 3306
        });

        const [tables] = await connection.execute("SHOW TABLES");
        const tableNames = tables.map(t => Object.values(t)[0]);

        let report = {};
        for (const name of ['qc_assessment', 'qc_assessments']) {
            if (tableNames.includes(name)) {
                const [cols] = await connection.execute(`DESCRIBE ${name}`);
                report[name] = cols.map(c => c.Field);
            } else {
                report[name] = "MISSING";
            }
        }

        fs.writeFileSync('schema_report.json', JSON.stringify(report, null, 2));
        await connection.end();
    } catch (err) {
        fs.writeFileSync('schema_report.json', JSON.stringify({ error: err.message }, null, 2));
    }
}

check();

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

        const [cols] = await connection.execute("DESCRIBE qc_assessments");
        fs.writeFileSync('detailed_schema.json', JSON.stringify(cols, null, 2));
        await connection.end();
    } catch (err) {
        fs.writeFileSync('detailed_schema.json', JSON.stringify({ error: err.message }, null, 2));
    }
}

check();

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
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

        for (const name of ['qc_assessment', 'qc_assessments']) {
            if (tableNames.includes(name)) {
                const [cols] = await connection.execute(`DESCRIBE ${name}`);
                console.log(`Table ${name} exists with columns: ${cols.map(c => c.Field).join(", ")}`);
            } else {
                console.log(`Table ${name} DOES NOT exist.`);
            }
        }

        await connection.end();
    } catch (err) {
        console.error("ERROR:", err);
    }
}

check();

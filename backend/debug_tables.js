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
        console.log("TABLES:", tables);

        for (const row of tables) {
            const tableName = Object.values(row)[0];
            const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
            console.log(`COLUMNS FOR ${tableName}:`, columns.map(c => c.Field));
        }

        await connection.end();
    } catch (err) {
        console.error("ERROR:", err);
    }
}

check();

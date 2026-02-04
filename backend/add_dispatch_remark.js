
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function addDispatchRemarkColumn() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'complaint_module',
            port: 3306
        });

        console.log("Adding dispatch_remark column to complaints table...");

        try {
            await connection.execute(
                "ALTER TABLE complaints ADD COLUMN dispatch_remark TEXT AFTER status"
            );
            console.log("✅ Added dispatch_remark column.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("⚠️ dispatch_remark column already exists.");
            } else {
                throw e;
            }
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

addDispatchRemarkColumn();

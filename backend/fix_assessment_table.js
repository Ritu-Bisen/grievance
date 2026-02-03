
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function fixAssessmentTable() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'complaint_module',
            port: 3306
        });

        console.log("Checking warehouse_assessments table...");

        // Add complaint_code column
        try {
            await connection.execute(
                "ALTER TABLE warehouse_assessments ADD COLUMN complaint_code VARCHAR(50) AFTER id"
            );
            console.log("✅ Added complaint_code column.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("⚠️ complaint_code column already exists.");
            } else {
                console.error("Error adding column:", e);
            }
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

fixAssessmentTable();

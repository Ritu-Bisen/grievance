import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function updateQcAssessmentTable() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'complaint_module',
            port: 3306
        });

        console.log("Checking qc_assessment table columns...");

        const [columns] = await connection.execute("DESCRIBE qc_assessment");
        const hasReportReceivedDate = columns.some(col => col.Field === 'report_received_date');

        if (!hasReportReceivedDate) {
            console.log("Adding report_received_date column...");
            await connection.execute(`
        ALTER TABLE qc_assessment 
        ADD COLUMN report_received_date TIMESTAMP NULL
      `);
            console.log("✅ Added report_received_date column to qc_assessment table.");
        } else {
            console.log("✅ report_received_date column already exists.");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

updateQcAssessmentTable();

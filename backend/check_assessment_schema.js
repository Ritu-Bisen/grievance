
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function checkAssessmentSchema() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'complaint_module',
            port: 3306
        });

        const [rows] = await connection.execute("DESCRIBE warehouse_assessments");
        console.log("Table 'warehouse_assessments' columns:");
        rows.forEach(row => {
            console.log(`- ${row.Field} (${row.Type})`);
        });

    } catch (err) {
        if (err.code === 'ER_NO_SUCH_TABLE') {
            console.error("❌ Table 'warehouse_assessments' DOES NOT EXIST.");
        } else {
            console.error("Error:", err);
        }
    } finally {
        if (connection) await connection.end();
    }
}

checkAssessmentSchema();

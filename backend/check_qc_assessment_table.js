
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function checkQcAssessmentTable() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'complaint_module',
            port: 3306
        });

        console.log("Checking qc_assessment table...");

        try {
            const [rows] = await connection.execute("DESCRIBE qc_assessment");
            console.log("✅ qc_assessment table exists with columns:");
            rows.forEach(row => {
                console.log(`- ${row.Field} (${row.Type})`);
            });
        } catch (e) {
            if (e.code === 'ER_NO_SUCH_TABLE') {
                console.log("⚠️ qc_assessment table does not exist. Creating...");

                await connection.execute(`
                CREATE TABLE qc_assessment (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    complaint_code VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (complaint_code) REFERENCES complaints(complaint_code)
                )
            `);

                console.log("✅ Created qc_assessment table.");
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

checkQcAssessmentTable();

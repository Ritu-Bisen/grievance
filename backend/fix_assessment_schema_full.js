
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function fixAssessmentSchemaFull() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'complaint_module',
            port: 3306
        });

        console.log("Updating warehouse_assessments table schema...");

        const queries = [
            "ALTER TABLE warehouse_assessments ADD COLUMN assessment_type VARCHAR(50)",
            "ALTER TABLE warehouse_assessments ADD COLUMN item_code VARCHAR(50)",
            "ALTER TABLE warehouse_assessments ADD COLUMN batch_no VARCHAR(50)",
            "ALTER TABLE warehouse_assessments ADD COLUMN same_complaint_present TINYINT(1)",
            "ALTER TABLE warehouse_assessments ADD COLUMN quality_description TEXT",
            "ALTER TABLE warehouse_assessments ADD COLUMN documents JSON"
        ];

        for (const query of queries) {
            try {
                await connection.execute(query);
                console.log(`✅ Executed: ${query.split('ADD COLUMN')[1]}`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log(`⚠️ Column already exists: ${query.split('ADD COLUMN')[1]}`);
                } else {
                    console.error(`❌ Error executing ${query}:`, e.message);
                }
            }
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

fixAssessmentSchemaFull();

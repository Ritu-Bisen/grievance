
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: "./.env" });

async function dumpAssessmentSchema() {
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
        const output = rows.map(r => `${r.Field} (${r.Type})`).join("\n");
        fs.writeFileSync("schema_assessment.txt", output);
        console.log("Schema saved to schema_assessment.txt");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

dumpAssessmentSchema();

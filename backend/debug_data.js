import mysql from \"mysql2/promise\";
import dotenv from \"dotenv\";
import path from \"path\";
import fs from \"fs\";
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

        // 1. Get latest complaints
        const [complaints] = await connection.execute(\"SELECT complaint_code, status FROM complaints ORDER BY created_at DESC LIMIT 5\");
        
        let data = { complaints };

        for (const c of complaints) {
            const code = c.complaint_code;

            const [qc] = await connection.execute(\"SELECT * FROM qc_assessments WHERE complaint_code = ?\", [code]);
            const [report] = await connection.execute(\"SELECT * FROM complaint_reports WHERE complaint_code = ?\", [code]);
            
            data[code] = { qc: qc[0] || null, report: report[0] || null };
        }

        // 2. Check schemas
        const [qcSchema] = await connection.execute(\"DESCRIBE qc_assessments\");
        const [reportSchema] = await connection.execute(\"DESCRIBE complaint_reports\");
        
        data.schemas = { qc_assessments: qcSchema, complaint_reports: reportSchema };

        fs.writeFileSync('debug_data.json', JSON.stringify(data, null, 2));
        await connection.end();
        console.log(\"Debug data written to debug_data.json\");
    } catch (err) {
        console.error(\"ERROR:\", err);
    }
}

check();

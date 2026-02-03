import pool from "./src/config/db.js";

async function checkTables() {
    try {
        const fs = await import('fs');
        const tablesToCheck = ['qc_assessments', 'complaint_reports', 'qc_assessment'];
        let output = "";
        for (const table of tablesToCheck) {
            try {
                const [columns] = await pool.execute(`DESCRIBE ${table}`);
                output += `\nCOLUMNS_OF_${table}:\n`;
                columns.forEach(c => {
                    output += `${c.Field} | ${c.Type}\n`;
                });
            } catch (err) {
                output += `\nERROR_${table}: ${err.message}\n`;
            }
        }
        fs.writeFileSync('db_check_output.txt', output);
        console.log("DB_CHECK_DONE");
    } catch (err) {
        console.error("Error checking tables:", err);
    } finally {
        process.exit();
    }
}

checkTables();

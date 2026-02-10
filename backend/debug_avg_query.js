import pool from "./src/config/db.js";

async function run() {
    try {
        console.log("Running debug query...");
        const [rows] = await pool.execute(`
      SELECT 
        l.complaint_code, 
        l.status, 
        l.changed_at,
        c.created_at,
        c.resolved_at,
        c.rejected_at
      FROM complaint_status_logs l
      JOIN complaints c ON l.complaint_code = c.complaint_code
      WHERE l.complaint_code = 'CMP-ADR-93D32C40'
      ORDER BY l.changed_at
    `);

        console.log("Rows found:", rows.length);
        if (rows.length > 0) {
            console.log("First row sample:", rows[0]);
            console.log("Created At:", rows[0].created_at);
            console.log("Resolved At:", rows[0].resolved_at);
        } else {
            console.log("No logs found for CMP-ADR-93D32C40. Checking if complaint exists...");
            const [complaint] = await pool.execute(`SELECT * FROM complaints WHERE complaint_code = 'CMP-ADR-93D32C40'`);
            console.log("Complaint:", complaint[0]);
        }
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

run();


import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

async function checkUser() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'complaint_module',
            port: 3306
        });

        const [rows] = await connection.execute(
            "SELECT id, email, role, warehouse_code FROM users WHERE email = 'wh002@gmail.com'"
        );
        console.log("User Data:", rows[0]);

        if (rows[0] && !rows[0].warehouse_code) {
            console.log("Updating warehouse_code to WH-002...");
            await connection.execute("UPDATE users SET warehouse_code='WH-002' WHERE email='wh002@gmail.com'");
            console.log("✅ Updated.");
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

checkUser();

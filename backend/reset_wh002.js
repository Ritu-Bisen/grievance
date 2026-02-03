
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: "./.env" });

async function resetPassword() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'complaint_module',
            port: 3306
        });

        const newPassword = "password";
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        console.log(`Resetting password for wh002@gmail.com...`);

        const [result] = await connection.execute(
            "UPDATE users SET password = ? WHERE email = 'wh002@gmail.com'",
            [hashedPassword]
        );

        console.log(`✅ Updated password for ${result.affectedRows} user(s).`);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (connection) await connection.end();
    }
}

resetPassword();

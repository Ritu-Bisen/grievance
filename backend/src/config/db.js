import dotenv from "dotenv";
import mysql from "mysql2/promise";

// 🔥 Load environment variables FIRST
dotenv.config({ path: "./.env" });

// 🔍 Debug (you can remove later)
console.log("DB_USER from db.js =", process.env.DB_USER);

let pool;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  console.log("✅ MySQL connected");
} catch (err) {
  console.error("❌ MySQL connection failed:", err.message);
  throw err; // ❗ DO NOT process.exit()
}

export default pool;

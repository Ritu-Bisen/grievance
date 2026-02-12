import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await connection.execute('DESCRIBE warehouse_assessments');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error('Error fetching schema:', err.message);
    } finally {
        await connection.end();
    }
}

checkSchema();

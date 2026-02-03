
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiV0FSRUhPVVNFIiwiZW1haWwiOiJ3aDAwMUBnbWFpbC5jb20iLCJ3YXJlaG91c2VfY29kZSI6IldILTAwMSIsImlhdCI6MTc2OTc1NjQ4MCwiZXhwIjoxNzY5ODQyODgwfQ.TU7ksDSZy5aiSOZ2jSZOghw3kVmrCyR_MuJ8iWbGn5A";
const secret = process.env.JWT_SECRET || "super_secret_key_123";

console.log("Secret used:", secret);

try {
    const decoded = jwt.verify(token, secret);
    console.log("✅ Token is VALID:", decoded);
} catch (err) {
    console.error("❌ Token is INVALID:", err.message);
}

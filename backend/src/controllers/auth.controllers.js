import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../config/db.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find active user
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND is_active = 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    // 2️⃣ Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3️⃣ JWT payload (IMPORTANT)
    const payload = {
      role: user.role,
      email: user.email
    };

    if (user.role === "FACILITY") {
      payload.facility_name = user.facility_name;
      payload.facility_address = user.facility_address;
    }

    if (user.role === "WAREHOUSE") {
      if (!user.warehouse_code) {
        return res.status(500).json({
          message: "Warehouse code not configured for this user"
        });
      }
      payload.warehouse_code = user.warehouse_code;
    }

    // 4️⃣ Generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    // 5️⃣ Clean response
    const response = {
      token,
      role: user.role
    };

    if (user.role === "FACILITY") {
      response.facility_name = user.facility_name;
      response.facility_address = user.facility_address;
    }

    if (user.role === "WAREHOUSE") {
      response.warehouse_code = user.warehouse_code;
    }

    res.json(response);

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

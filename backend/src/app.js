import express from "express";
import cors from "cors";

import grievanceRoutes from "./routes/grievance.routes.js";
import authRoutes from "./routes/auth.routes.js"; // ✅ ADD THIS

const app = express();

/* ================= CORS ================= */

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  credentials: true
}));

/* ================= BODY PARSER ================= */

app.use(express.json());

/* ================= DISABLE CACHE ================= */

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

/* ================= STATIC FILES ================= */

app.use("/uploads", express.static("uploads"));
app.use("/uploads/assessment", express.static("uploads/assessment"));

/* ================= ROUTES ================= */

// 🔐 AUTH ROUTES (LOGIN)
app.use("/api/auth", authRoutes);

// 📦 GRIEVANCE + FACILITY + WAREHOUSE
app.use("/api/grievance", grievanceRoutes);

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.send("Backend working");
});

export default app;

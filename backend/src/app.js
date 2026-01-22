import express from "express";
import cors from "cors";
import grievanceRoutes from "./routes/grievance.routes.js";

const app = express();

/* CORS */
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  credentials: true
}));

app.use(express.json());

/* 🔥 DISABLE CACHE (MANDATORY) */
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use("/uploads", express.static("uploads"));
app.use("/api/grievance", grievanceRoutes);

app.get("/", (req, res) => {
  res.send("Backend working");
});

export default app;

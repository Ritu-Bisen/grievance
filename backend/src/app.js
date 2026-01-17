import express from "express";
import cors from "cors";
import grievanceRoutes from "./routes/grievance.routes.js";

const app = express();

/* 🔥 ENABLE CORS */
app.use(cors({
  origin: ["http://localhost:3000","https://stnjr6z8-5000.euw.devtunnels.ms","http://localhost:5173"],// or 5173 if Vite
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/grievance", grievanceRoutes);
app.get("/", (req, res) => {
  res.send("Backend working");
});

export default app;

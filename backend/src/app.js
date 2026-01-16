require("dotenv").config();   // MUST BE FIRST

const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express(); // ✅ app must be defined BEFORE using it

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
const grievanceRoutes = require("./routes/grievance.routes");
app.use("/api/grievance", grievanceRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Grievance System Backend Running");
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

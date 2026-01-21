import {
  warehouseDashboardService
} from "../services/warehouse.service.js";

/* ================= WAREHOUSE DASHBOARD ================= */

export const warehouseDashboard = async (req, res) => {
  try {
    
    const complaints = await warehouseDashboardService(
      req.query,
      req.user   // from Auth.js
    );

    res.json({ complaints });
  } catch (err) {
    console.error("❌ WAREHOUSE DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Warehouse dashboard load failed" });
  }
};

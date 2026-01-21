import pool from "../config/db.js";
import {
  warehouseDashboardService
} from "../services/warehouse.service.js";

/* ================= WAREHOUSE DASHBOARD ================= */

export const warehouseDashboard = async (req, res) => {
  try {
    const complaints = await warehouseDashboardService(
      req.query,
      req.user   // comes from Auth.js
    );

    res.json({ complaints });
  } catch (err) {
    console.error("❌ WAREHOUSE DASHBOARD ERROR:", err);
    res.status(500).json({
      message: "Warehouse dashboard load failed"
    });
  }
};

/* ================= RECEIVE SAMPLE (WAREHOUSE) ================= */
/*
STATUS FLOW:
SAMPLE_DISPATCHED_FACILITY -> IN_PROGRESS_WH
*/

/* ================= RECEIVE SAMPLE (WAREHOUSE) ================= */
/*
STATUS FLOW:
SAMPLE_DISPATCHED_FACILITY -> SAMPLE_RECEIVED_WH
*/

export const receiveSampleWarehouse = async (req, res) => {
  try {
    const { complaint_code } = req.body;

    if (!complaint_code) {
      return res.status(400).json({
        message: "complaint_code is required"
      });
    }

    await pool.execute(
      `UPDATE complaints
       SET status = 'SAMPLE_RECEIVED_WH'
       WHERE complaint_code = ?`,
      [complaint_code]
    );

    res.json({
      message: "Sample received successfully",
      status: "SAMPLE_RECEIVED_WH"
    });
  } catch (err) {
    console.error("❌ RECEIVE SAMPLE ERROR:", err);
    res.status(500).json({
      message: "Failed to receive sample"
    });
  }
};

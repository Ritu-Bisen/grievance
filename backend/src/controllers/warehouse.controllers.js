import pool from "../config/db.js";
import { warehouseDashboardService } from "../services/warehouse.service.js";

/* ================= WAREHOUSE DASHBOARD ================= */
export const warehouseDashboard = async (req, res) => {
  try {
    const complaints = await warehouseDashboardService(req.query, req.user);
    res.json({ complaints });
  } catch (err) {
    res.status(500).json({ message: "Warehouse dashboard load failed" });
  }
};

/* ================= RECEIVE SAMPLE ================= */
export const receiveSampleWarehouse = async (req, res) => {
  const { complaint_code } = req.body;
  if (!complaint_code)
    return res.status(400).json({ message: "complaint_code is required" });

  await pool.execute(
    "UPDATE complaints SET status='SAMPLE_RECEIVED_WH' WHERE complaint_code=?",
    [complaint_code]
  );

  res.json({ status: "SAMPLE_RECEIVED_WH" });
};

/* ================= APPROVE ================= */
export const approveWarehouse = async (req, res) => {
  const { complaint_code } = req.body;
  if (!complaint_code)
    return res.status(400).json({ message: "complaint_code is required" });

  await pool.execute(
    "UPDATE complaints SET status='IN_PROGRESS_WH' WHERE complaint_code=?",
    [complaint_code]
  );

  res.json({ status: "IN_PROGRESS_WH" });
};

/* ================= REJECT ================= */
export const rejectWarehouse = async (req, res) => {
  const { complaint_code } = req.body;
  if (!complaint_code)
    return res.status(400).json({ message: "complaint_code is required" });

  await pool.execute(
    "UPDATE complaints SET status='REJECTED_WH' WHERE complaint_code=?",
    [complaint_code]
  );

  res.json({ status: "REJECTED_WH" });
};

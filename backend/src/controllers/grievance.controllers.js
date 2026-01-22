import pool from "../config/db.js";
import {
  createComplaintService,
  dashboardService
} from "../services/grievance.service.js";
import { dispatchFromFacilityService } from "../services/grievance.service.js";


export const createComplaint = async (req, res) => {
  console.log("🔥 CREATE COMPLAINT API HIT");

  try {
    const facility = JSON.parse(req.body.facility);
    const item = JSON.parse(req.body.item);
    const batch = JSON.parse(req.body.batch);

    const documents = req.files?.map(f => f.filename) || [];

    const complaintCode = await createComplaintService(
      {
        ...req.body,
        facility,
        item,
        batch
      },
      documents
    );

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint_code: complaintCode
    });

  } catch (err) {
    console.error("❌ CREATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const complaintDashboard = async (req, res) => {
  try {
    const complaints = await dashboardService(req.query);
    res.json({ complaints });
  } catch (err) {
    res.status(500).json({ message: "Dashboard load failed" });
  }
};

export const viewComplaint = async (req, res) => {
  const { code } = req.params;

  const [rows] = await pool.execute(
    "SELECT * FROM complaints WHERE complaint_code = ?",
    [code]
  );

  if (rows.length === 0) {
    return res.status(404).json({ message: "Not found" });
  }

  res.json(rows[0]);
};
export const dispatchFromFacility = async (req, res) => {
  try {
    const { complaint_code } = req.body;

    await dispatchFromFacilityService(complaint_code);

    res.json({
      message: "Sample dispatched from facility successfully"
    });
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
};


import pool from "../config/db.js";
import {
  createComplaintService,
  dashboardService,
  dispatchFromFacilityService
} from "../services/grievance.service.js";

/* ============================================================= */
/*                    CREATE COMPLAINT                           */
/* ============================================================= */

export const createComplaint = async (req, res) => {
  try {
    const facility = JSON.parse(req.body.facility);
    const item = JSON.parse(req.body.item);
    const batch = JSON.parse(req.body.batch);

    // ✅ ALWAYS STORE DOCUMENTS AS JSON ARRAY
    const documents = req.files?.map(file => ({
      file_name: file.filename,
      original_name: file.originalname
    })) || [];

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
    console.error("❌ CREATE COMPLAINT ERROR:", err);
    res.status(500).json({
      message: "Complaint creation failed"
    });
  }
};

/* ============================================================= */
/*                 COMPLAINT DASHBOARD (USER)                    */
/* ============================================================= */

export const complaintDashboard = async (req, res) => {
  try {
    const complaints = await dashboardService(req.query);
    res.json({ complaints });
  } catch (err) {
    console.error("❌ DASHBOARD ERROR:", err);
    res.status(500).json({
      message: "Dashboard load failed"
    });
  }
};

/* ============================================================= */
/*                    VIEW COMPLAINT (🔥 FIXED)                  */
/* ============================================================= */

export const viewComplaint = async (req, res) => {
  try {
    const { code } = req.params;

    const [rows] = await pool.execute(
      "SELECT * FROM complaints WHERE complaint_code = ?",
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const complaint = rows[0];

    /* 🔥 BULLETPROOF DOCUMENT HANDLING */
    let documents = [];

    if (complaint.documents) {
      if (typeof complaint.documents === "string") {
        try {
          documents = JSON.parse(complaint.documents);
        } catch {
          // old records fallback
          documents = complaint.documents.split(",").map(name => ({
            original_name: name,
            file_name: name
          }));
        }
      } else if (Array.isArray(complaint.documents)) {
        documents = complaint.documents;
      }
    }

    res.json({
      ...complaint,
      documents
    });

  } catch (err) {
    console.error("❌ VIEW COMPLAINT ERROR:", err);
    res.status(500).json({
      message: "Failed to load complaint"
    });
  }
};

/* ============================================================= */
/*              DISPATCH SAMPLE FROM FACILITY                    */
/* ============================================================= */

export const dispatchFromFacility = async (req, res) => {
  try {
    const { complaint_code } = req.body;

    if (!complaint_code) {
      return res.status(400).json({
        message: "complaint_code is required"
      });
    }

    await dispatchFromFacilityService(complaint_code);

    res.json({
      message: "Sample dispatched from facility successfully"
    });

  } catch (err) {
    console.error("❌ DISPATCH ERROR:", err);
    res.status(400).json({
      message: err.message || "Dispatch failed"
    });
  }
};

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
    // 🔐 facility MUST come from token, NOT frontend
    if (req.user.role !== "FACILITY") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const facility = {
      name: req.user.facility_name,
      address: req.user.facility_address
    };

    const item = JSON.parse(req.body.item);
    const batch = JSON.parse(req.body.batch);

    const documents =
      req.files?.map(file => ({
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
    // 🔥 STATUS LOG (FACILITY START)
await pool.execute(
  `INSERT INTO complaint_status_logs (complaint_code, status)
   VALUES (?, 'SUBMITTED')`,
  [complaintCode]
);


    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint_code: complaintCode
    });

  } catch (err) {
    console.error("❌ CREATE COMPLAINT ERROR:", err);
    res.status(500).json({ message: "Complaint creation failed" });
  }
};

/* ============================================================= */
/*                 COMPLAINT DASHBOARD (FACILITY)                */
/* ============================================================= */

export const complaintDashboard = async (req, res) => {
  try {
    if (req.user.role !== "FACILITY") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const complaints = await dashboardService({
      ...req.query,
      facility_name: req.user.facility_name   // 🔥 MAIN FIX
    });

    res.json({ complaints });

  } catch (err) {
    console.error("❌ DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Dashboard load failed" });
  }
};

/* ============================================================= */
/*                    VIEW COMPLAINT                             */
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

    // 🔐 FACILITY ACCESS CONTROL
    if (
      req.user.role === "FACILITY" &&
      complaint.facility_name !== req.user.facility_name
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    let documents = [];
    if (complaint.documents) {
      documents =
        typeof complaint.documents === "string"
          ? JSON.parse(complaint.documents)
          : complaint.documents;
    }

    res.json({ ...complaint, documents });

  } catch (err) {
    console.error("❌ VIEW COMPLAINT ERROR:", err);
    res.status(500).json({ message: "Failed to load complaint" });
  }
};

/* ============================================================= */
/*              DISPATCH SAMPLE FROM FACILITY                    */
/* ============================================================= */

export const dispatchFromFacility = async (req, res) => {
  try {
    const { complaint_code } = req.body;

    await dispatchFromFacilityService(
      complaint_code,
      req.user.facility_name   // 🔐 enforce ownership
    );
    // 🔥 STATUS LOG (FACILITY END)
await pool.execute(
  `INSERT INTO complaint_status_logs (complaint_code, status)
   VALUES (?, 'SAMPLE_DISPATCHED_FACILITY')`,
  [complaint_code]
);


    res.json({ message: "Sample dispatched successfully" });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

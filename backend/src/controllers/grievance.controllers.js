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
    // 🔐 Allow FACILITY or WAREHOUSE
    if (req.user.role !== "FACILITY" && req.user.role !== "WAREHOUSE") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let facility = {};

    if (req.user.role === "FACILITY") {
      facility = {
        name: req.user.facility_name,
        address: req.user.facility_address
      };
    } else {
      // WAREHOUSE
      facility = {
        name: `WAREHOUSE: ${req.user.warehouse_code}`,
        address: "Warehouse Initiated"
      };
    }

    const item = JSON.parse(req.body.item);
    const batch = JSON.parse(req.body.batch);

    const documents =
      req.files?.documents?.map(file => ({
        file_name: file.filename,
        original_name: file.originalname
      })) || [];

    const opdSlipFile = req.files?.opd_slip?.[0]?.filename || null;


    const complaintCode = await createComplaintService(
      {
        ...req.body,
        facility,
        item,
        batch,
        opd_slip: opdSlipFile
      },
      documents
    );

    // 🔥 WAREHOUSE ASSESSMENT (IF APPLICABLE)
    if (req.user.role === "WAREHOUSE" && req.body.tender_no) {
      await pool.execute(
        `INSERT INTO warehouse_assessments
        (
          complaint_code,
          assessment_type,
          item_code,
          batch_no,
          tender_no,
          po_no,
          stock_warehouse,
          stock_facility,
          total_stock,
          same_complaint_present,
          remarks,
          quality_description,
          documents,
          sample_dispatch_date
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?, NULL)`,
        [
          complaintCode,
          req.body.complaint_type,
          item.code,
          batch.batchNo,
          req.body.tender_no || null,
          req.body.po_no || null,
          req.body.stock_warehouse || null,
          req.body.stock_facility || null,
          req.body.total_stock || null,
          req.body.same_complaint_present || null,
          "Assessment submitted during creation",
          req.body.quality_description || null,
          "[]" // No separate docs for assessment in this flow, using complaint docs
        ]
      );

      // 🔥 STATUS LOG (Set to SUBMITTED_WH)
      await pool.execute(
        `UPDATE complaints SET status = 'SUBMITTED_WH' WHERE complaint_code = ?`,
        [complaintCode]
      );

      // Add log for SUBMITTED_WH
      await pool.execute(
        `INSERT INTO complaint_status_logs (complaint_code, status) VALUES (?, 'SUBMITTED_WH')`,
        [complaintCode]
      );

      // Add log for IN_PROGRESS_WH
      await pool.execute(
        `INSERT INTO complaint_status_logs (complaint_code, status) VALUES (?, 'IN_PROGRESS_WH')`,
        [complaintCode]
      );
    } else {
      // 🔥 STATUS LOG (FACILITY START)
      await pool.execute(
        `INSERT INTO complaint_status_logs (complaint_code, status)
       VALUES (?, 'SUBMITTED')`,
        [complaintCode]
      );
    }

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

    // 🔥 Fetch warehouse assessment for lifecycle
    const [warehouseRows] = await pool.execute(
      "SELECT * FROM warehouse_assessments WHERE complaint_code = ?",
      [code]
    );
    const warehouseAssessment = warehouseRows.length > 0 ? warehouseRows[0] : null;

    // 🔥 Fetch QC assessment for lifecycle
    const [qcRows] = await pool.execute(
      "SELECT * FROM qc_assessments WHERE complaint_code = ?",
      [code]
    );
    const qcAssessment = qcRows.length > 0 ? qcRows[0] : null;

    res.json({
      ...complaint,
      documents,
      warehouseAssessment,
      qcAssessment
    });

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

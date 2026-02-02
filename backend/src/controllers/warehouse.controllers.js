import pool from "../config/db.js";
import { warehouseDashboardService } from "../services/warehouse.service.js";

/* ============================================================= */
/* 🔐 SAFE JSON PARSER (VERY IMPORTANT)                           */
/* ============================================================= */

const safeJson = (value) => {
  try {
    if (!value || value === "" || value === " ") return [];
    if (typeof value === "object") return value;
    return JSON.parse(value);
  } catch (err) {
    return [];
  }
};

/* ============================================================= */
/*                    WAREHOUSE DASHBOARD                        */
/* ============================================================= */

export const warehouseDashboard = async (req, res) => {
  try {
    const complaints = await warehouseDashboardService(
      req.query,
      req.user
    );
    res.json({ complaints });
  } catch (err) {
    console.error("WAREHOUSE DASHBOARD ERROR:", err);
    res.status(500).json({
      message: "Warehouse dashboard load failed"
    });
  }
};

/* ============================================================= */
/*                    RECEIVE SAMPLE                             */
/* ============================================================= */

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
    // 🔥 STATUS LOG
await pool.execute(
  `INSERT INTO complaint_status_logs (complaint_code, status)
   VALUES (?, 'SAMPLE_RECEIVED_WH')`,
  [complaint_code]
);


    res.json({ status: "SAMPLE_RECEIVED_WH" });
  } catch (err) {
    console.error("RECEIVE SAMPLE ERROR:", err);
    res.status(500).json({
      message: "Failed to receive sample"
    });
  }
};

/* ============================================================= */
/*                    APPROVE                                   */
/* ============================================================= */

export const approveWarehouse = async (req, res) => {
  try {
    const { complaint_code } = req.body;

    if (!complaint_code) {
      return res.status(400).json({
        message: "complaint_code is required"
      });
    }

    await pool.execute(
      `UPDATE complaints
       SET status = 'IN_PROGRESS_WH'
       WHERE complaint_code = ?`,
      [complaint_code]
    );
     // 🔥 STATUS LOG
await pool.execute(
  `INSERT INTO complaint_status_logs (complaint_code, status)
   VALUES (?, 'IN_PROGRESS_WH')`,
  [complaint_code]
);

    res.json({ status: "IN_PROGRESS_WH" });
  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({
      message: "Approve failed"
    });
  }
};

/* ============================================================= */
/*                    REJECT                                    */
/* ============================================================= */

export const rejectWarehouse = async (req, res) => {
  try {
    const { complaint_code } = req.body;

    if (!complaint_code) {
      return res.status(400).json({
        message: "complaint_code is required"
      });
    }

    await pool.execute(
      `UPDATE complaints
       SET status = 'REJECTED_WH',
           rejected_at = NOW(),
           resolution_remark = 'Complaint rejected at warehouse as it was found invalid during initial verification.'
       WHERE complaint_code = ?`,
      [complaint_code]
    );
    // 🔥 STATUS LOG
await pool.execute(
  `INSERT INTO complaint_status_logs (complaint_code, status)
   VALUES (?, 'REJECTED_WH')`,
  [complaint_code]
);


    res.json({ status: "REJECTED_WH" });

  } catch (err) {
    console.error("REJECT ERROR:", err);
    res.status(500).json({
      message: "Reject failed"
    });
  }
};


/* ============================================================= */
/*                SUBMIT WAREHOUSE ASSESSMENT                    */
/* ============================================================= */

export const submitWarehouseAssessment = async (req, res) => {
  try {
    const {
      complaint_code,
      assessment_type,
      item_code,
      batch_no,
      tender_no,
      po_no,
      stock_warehouse,
      stock_facility,
      total_stock,
      same_complaint_present,   // ✅ FIX 1: ADDED
      remarks,
      adr_severity,
      quality_description
    } = req.body;

    if (!complaint_code || !item_code || !batch_no || !assessment_type) {
      return res.status(400).json({
        message: "Required fields missing"
      });
    }

    const [[complaint]] = await pool.execute(
      `SELECT item_code, batch_no
       FROM complaints
       WHERE complaint_code = ?`,
      [complaint_code]
    );

    if (
      !complaint ||
      complaint.item_code !== item_code ||
      complaint.batch_no !== batch_no
    ) {
      return res.status(400).json({
        message: "Item code / Batch no mismatch with complaint"
      });
    }

    const [[existing]] = await pool.execute(
      `SELECT id FROM warehouse_assessments WHERE complaint_code=?`,
      [complaint_code]
    );

    if (existing) {
      return res.status(400).json({
        message: "Assessment already submitted"
      });
    }

    const documents = (req.files || []).map(file => ({
      original_name: file.originalname,
      file_name: file.filename
    }));

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
        adr_severity,
        quality_description,
        documents
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,   // ✅ FIX 2: 14 placeholders
      [
        complaint_code,
        assessment_type,
        item_code,
        batch_no,
        tender_no || null,
        po_no || null,
        stock_warehouse || null,
        stock_facility || null,
        total_stock || null,
        same_complaint_present || null,
        remarks || null,
        adr_severity || null,
        quality_description || null,
        JSON.stringify(documents)
      ]
    );

    res.json({
      message: "Assessment submitted successfully"
    });
  } catch (err) {
    console.error("SUBMIT ASSESSMENT ERROR:", err);
    res.status(500).json({
      message: "Assessment submit failed"
    });
  }
};

/* ============================================================= */
/*                VIEW WAREHOUSE ASSESSMENT                      */
/* ============================================================= */

export const viewWarehouseAssessment = async (req, res) => {
  try {
    const { complaintCode } = req.params;

    const [[complaint]] = await pool.execute(
      "SELECT * FROM complaints WHERE complaint_code=?",
      [complaintCode]
    );

    const [[assessment]] = await pool.execute(
      "SELECT * FROM warehouse_assessments WHERE complaint_code=?",
      [complaintCode]
    );

    res.json({
      complaint: complaint
        ? { ...complaint, documents: safeJson(complaint.documents) }
        : null,

      assessment: assessment
        ? { ...assessment, documents: safeJson(assessment.documents) }
        : null
    });
  } catch (err) {
    console.error("VIEW ASSESSMENT ERROR:", err);
    res.status(500).json({
      message: "Failed to load warehouse assessment"
    });
  }
};

/* ============================================================= */
/*                    RESOLVE COMPLAINT                          */
/* ============================================================= */
export const resolveComplaint = async (req, res) => {
  const { complaint_code, resolution_remark } = req.body;

  if (!complaint_code) {
    return res.status(400).json({
      message: "complaint_code required"
    });
  }

  try {
    await pool.execute(
      `UPDATE complaints
       SET status = 'RESOLVED',
           resolution_remark = ?,
           resolved_at = NOW()
       WHERE complaint_code = ?`,
      [resolution_remark || null, complaint_code]
    );
    // 🔥 STATUS LOG (FINAL END)
await pool.execute(
  `INSERT INTO complaint_status_logs (complaint_code, status)
   VALUES (?, 'RESOLVED')`,
  [complaint_code]
);


    res.json({
      message: "Complaint resolved successfully"
    });
  } catch (err) {
    console.error("RESOLVE ERROR:", err);
    res.status(500).json({
      message: "Failed to resolve complaint"
    });
  }
};


/* ============================================================= */
/*                    DISPATCH SAMPLE                            */
/* ============================================================= */

export const dispatchSample = async (req, res) => {
  const { complaint_code, remarks } = req.body;

  if (!complaint_code) {
    return res.status(400).json({ message: "complaint_code required" });
  }

  try {
    await pool.execute(
      `UPDATE complaints
       SET status = 'SAMPLE_DISPATCHED_WH',
           dispatch_remark = ?
       WHERE complaint_code = ?`,
      [remarks || null, complaint_code]
    );
    // 🔥 STATUS LOG (WAREHOUSE END / QC START)
await pool.execute(
  `INSERT INTO complaint_status_logs (complaint_code, status)
   VALUES (?, 'SAMPLE_DISPATCHED_WH')`,
  [complaint_code]
);


    res.json({ message: "Sample dispatched from warehouse" });
  } catch (err) {
    console.error("DISPATCH ERROR:", err);
    res.status(500).json({ message: "Failed to dispatch sample" });
  }
};

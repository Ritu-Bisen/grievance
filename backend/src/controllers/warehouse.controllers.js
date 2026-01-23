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
      req.user   // Auth se aata hai
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
       SET status = 'REJECTED_WH'
       WHERE complaint_code = ?`,
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
        remarks,
        adr_severity,
        quality_description,
        documents
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
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

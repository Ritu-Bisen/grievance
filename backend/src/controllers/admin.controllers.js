import pool from "../config/db.js";

/* ============================================================= */
/*                  ADMIN DASHBOARD (REPORTS)                    */
/* ============================================================= */

export const adminDashboard = async (req, res) => {
  try {
    const {
      complaintCode,
      status,
      fromDate,
      toDate,
      complaintType
    } = req.query;

    let sql = `
      SELECT *
      FROM complaints
      WHERE 1 = 1
    `;
    const params = [];

    if (complaintCode) {
      sql += " AND complaint_code LIKE ?";
      params.push(`%${complaintCode}%`);
    }

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    if (complaintType) {
      sql += " AND complaint_type = ?";
      params.push(complaintType);
    }

    if (fromDate) {
      sql += " AND DATE(created_at) >= ?";
      params.push(fromDate);
    }

    if (toDate) {
      sql += " AND DATE(created_at) <= ?";
      params.push(toDate);
    }

    sql += " ORDER BY created_at DESC";

    const [rows] = await pool.execute(sql, params);
    res.json({ complaints: rows });

  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Admin dashboard failed" });
  }
};


/* ============================================================= */
/*                 ADMIN REPORT VIEW (FULL REPORT)               */
/* ============================================================= */

export const adminReportView = async (req, res) => {
  try {
    const { complaintCode } = req.params;

    /* ================= COMPLAINT ================= */
    const [complaintRows] = await pool.execute(
      "SELECT * FROM complaints WHERE complaint_code = ?",
      [complaintCode]
    );

    if (complaintRows.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const complaint = complaintRows[0];

    /* ================= WAREHOUSE ASSESSMENT ================= */
    const [warehouseRows] = await pool.execute(
      "SELECT * FROM warehouse_assessments WHERE complaint_code = ?",
      [complaintCode]
    );

    let warehouseAssessment =
      warehouseRows.length > 0 ? warehouseRows[0] : null;

    // 🔥 DOCUMENTS FIX (MAIN POINT)
    if (warehouseAssessment?.documents) {
      try {
        warehouseAssessment.documents = JSON.parse(
          warehouseAssessment.documents
        );
      } catch {
        // keep as-is
      }
    }

    /* ================= QC ASSESSMENT (FUTURE SAFE) ================= */
    const qcAssessment = null;

    res.json({
      complaint,
      warehouseAssessment,
      qcAssessment
    });

  } catch (err) {
    console.error("ADMIN REPORT VIEW ERROR:", err);
    res.status(500).json({ message: "Failed to load admin report" });
  }
};

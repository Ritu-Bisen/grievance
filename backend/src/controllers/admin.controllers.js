import pool from "../config/db.js";

/* ============================================================= */
/*                  ADMIN DASHBOARD (REPORTS)                    */
/* ============================================================= */


export const adminDashboard = async (req, res) => {
  try {
    const {
      complaintCode,
      status,
      statusGroup,
      fromDate,
      toDate,
      complaintType
    } = req.query;

    /* ================= BASE QUERY ================= */

    let sql = `
      SELECT *
      FROM complaints
      WHERE 1 = 1
    `;
    const params = [];

    /* ================= EXISTING FILTERS (UNCHANGED) ================= */

    if (complaintCode) {
      sql += " AND complaint_code LIKE ?";
      params.push(`%${complaintCode}%`);
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

    /* ================= STATUS / GROUP LOGIC ================= */

    if (status) {
      // single status (child click)
      sql += " AND status = ?";
      params.push(status);
    } else if (statusGroup) {
      // parent click
      if (statusGroup === "DISPATCHED") {
        sql += " AND status IN (?, ?)";
        params.push(
          "SAMPLE_DISPATCHED_FACILITY",
          "SAMPLE_DISPATCHED_WH"
        );
      }

      if (statusGroup === "RECEIVED") {
        sql += " AND status IN (?, ?)";
        params.push(
          "SAMPLE_RECEIVED_WH",
          "SAMPLE_RECEIVED_QC"
        );
      }

      if (statusGroup === "IN_PROGRESS") {
        sql += " AND status IN (?, ?)";
        params.push(
          "IN_PROGRESS_WH",
          "IN_PROGRESS_QC"
        );
      }
    }

    sql += " ORDER BY created_at DESC";

    /* ================= FETCH COMPLAINTS ================= */

    const [complaints] = await pool.execute(sql, params);

    /* ================= STATUS COUNTS (FOR DASHBOARD) ================= */

    const [countRows] = await pool.execute(`
      SELECT status, COUNT(*) AS total
      FROM complaints
      GROUP BY status
    `);

    const counts = {};

    countRows.forEach(row => {
      counts[row.status] = row.total;
    });

    /* ================= PARENT TOTALS ================= */

    counts.SAMPLE_DISPATCHED_TOTAL =
      (counts.SAMPLE_DISPATCHED_FACILITY || 0) +
      (counts.SAMPLE_DISPATCHED_WH || 0);

    counts.SAMPLE_RECEIVED_TOTAL =
      (counts.SAMPLE_RECEIVED_WH || 0) +
      (counts.SAMPLE_RECEIVED_QC || 0);

    counts.IN_PROGRESS_TOTAL =
      (counts.IN_PROGRESS_WH || 0) +
      (counts.IN_PROGRESS_QC || 0);

    /* ================= RESPONSE ================= */

    res.json({
      complaints,
      counts
    });

  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Admin dashboard failed" });
  }
};


/* ============================================================= */
/* 🔐 SAFE JSON PARSER                                            */
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
    complaint.documents = safeJson(complaint.documents);

    /* ================= WAREHOUSE ASSESSMENT ================= */
    const [warehouseRows] = await pool.execute(
      "SELECT * FROM warehouse_assessments WHERE complaint_code = ?",
      [complaintCode]
    );

    let warehouseAssessment =
      warehouseRows.length > 0 ? warehouseRows[0] : null;

    /* 🔥 DOCUMENTS JSON FIX */
    if (warehouseAssessment) {
      warehouseAssessment.documents = safeJson(warehouseAssessment.documents);
    }

    /* ================= QC ASSESSMENT ================= */
    const [qcRows] = await pool.execute(
      "SELECT * FROM qc_assessments WHERE complaint_code = ?",
      [complaintCode]
    );

    const qcAssessment = qcRows.length > 0 ? qcRows[0] : null;

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
export const avgHandlingTime = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        l.complaint_code, 
        l.status, 
        l.changed_at,
        c.created_at,
        c.resolved_at,
        c.rejected_at
      FROM complaint_status_logs l
      JOIN complaints c ON l.complaint_code = c.complaint_code
      ORDER BY l.complaint_code, l.changed_at
    `);

    const data = {};
    rows.forEach(r => {
      if (!data[r.complaint_code]) data[r.complaint_code] = [];
      data[r.complaint_code].push(r);
    });

    const diffDays = (a, b) =>
      Math.ceil((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));

    const facility = [];
    const warehouse = [];
    const qc = [];

    for (const code in data) {
      const logs = data[code];
      const complaintInfo = logs[0]; // All logs for same code share complaint info

      const startDate = complaintInfo.created_at;
      const endDate = complaintInfo.resolved_at || complaintInfo.rejected_at || null;

      if (code === 'CMP-ADR-93D32C40' || code === 'CMP-C16A0DCA') {
        try {
          fs.appendFileSync('c:/Users/ritu2/Desktop/grievance_demo/backend/debug_avg.log',
            `DEBUG ${code}: startDate=${startDate}, created_at=${complaintInfo.created_at}\n`
          );
        } catch (e) {
          console.error("Log failed", e);
        }
      }

      const get = (s, e) => {
        const start = logs.find(l => l.status === s);
        const end = logs.find(l => l.status === e);

        if (!start) return null;

        // 🔥 IMPORTANT CHANGE (DYNAMIC DAYS)
        const endTime = end ? end.changed_at : new Date();

        return diffDays(start.changed_at, endTime);
      };


      // FACILITY
      const f = get("SUBMITTED", "SAMPLE_DISPATCHED_FACILITY");
      if (f !== null) facility.push({ code, days: f, start_date: startDate, end_date: endDate });

      // WAREHOUSE
      let wEnd = logs.some(l => l.status === "RESOLVED")
        ? "RESOLVED"
        : "SAMPLE_DISPATCHED_WH";

      const w = get("SAMPLE_DISPATCHED_FACILITY", wEnd);
      if (w !== null) warehouse.push({ code, days: w, start_date: startDate, end_date: endDate });

      // QC
      const q = get("SAMPLE_DISPATCHED_WH", "RESOLVED");
      if (q !== null) qc.push({ code, days: q, start_date: startDate, end_date: endDate });
    }

    const avg = arr =>
      arr.length
        ? Math.ceil(arr.reduce((a, b) => a + b.days, 0) / arr.length)
        : 0;

    res.json({
      average: {
        facility: avg(facility),
        warehouse: avg(warehouse),
        qc: avg(qc)
      },
      details: {
        FACILITY: facility,
        WAREHOUSE: warehouse,
        QC: qc
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Avg handling time failed" });
  }
};

/* ============================================================= */
/*              RESOLUTION TIME GRAPH DATA                       */
/* ============================================================= */
export const resolutionTimeGraph = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        complaint_code,
        status,
        created_at,
        resolved_at,
        rejected_at,
        DATEDIFF(COALESCE(resolved_at, rejected_at, NOW()), created_at) AS days
      FROM complaints
      WHERE status IN ('RESOLVED', 'REJECTED_WH')
    `);

    const buckets = {
      "0_10": [],
      "11_20": [],
      "21_100": [],
      "100_plus": []
    };

    rows.forEach(r => {
      const d = r.days ?? 0;

      const entry = {
        code: r.complaint_code,
        days: d
      };

      if (d <= 10) buckets["0_10"].push(entry);
      else if (d <= 20) buckets["11_20"].push(entry);
      else if (d <= 100) buckets["21_100"].push(entry);
      else buckets["100_plus"].push(entry);
    });

    res.json({
      summary: {
        "0_10": buckets["0_10"].length,
        "11_20": buckets["11_20"].length,
        "21_100": buckets["21_100"].length,
        "100_plus": buckets["100_plus"].length
      },
      details: buckets
    });

  } catch (err) {
    console.error("❌ RESOLUTION GRAPH ERROR:", err);
    res.status(500).json({ message: "Failed to load resolution graph" });
  }
};
import pool from "../config/db.js";

/* ============================================================= */
/*                    QC DASHBOARD                               */
/* ============================================================= */

export const getQcDashboard = async (req, res) => {
    try {
        const { complaintCode, status, fromDate, toDate, complaintType } = req.query;

        let query = `
      SELECT 
        c.id,
        c.complaint_code,
        c.complaint_type,
        c.category,
        c.facility_name,
        c.facility_address,
        c.item_code,
        c.item_name,
        c.batch_no,
        c.warehouse_batch,
        c.mfg_date,
        c.exp_date,
        c.purchase_date,
        c.quantity_received,
        c.affected_quantity,
        c.description,
        c.documents,
        c.status,
        c.created_at,
        c.warehouse_code,
        c.complaint_close_date,
        wa.sample_dispatch_date,
        qa.status AS qc_status
      FROM complaints c
      INNER JOIN warehouse_assessments wa ON c.complaint_code = wa.complaint_code
      LEFT JOIN qc_assessments qa ON c.complaint_code = qa.complaint_code
      WHERE wa.sample_dispatch_date IS NOT NULL
    `;

        const params = [];

        if (complaintCode) {
            query += ` AND c.complaint_code LIKE ?`;
            params.push(`%${complaintCode}%`);
        }

        if (status) {
            query += ` AND c.status = ?`;
            params.push(status);
        }

        if (complaintType) {
            query += ` AND c.complaint_type = ?`;
            params.push(complaintType);
        }

        if (fromDate) {
            query += ` AND DATE(c.created_at) >= ?`;
            params.push(fromDate);
        }

        if (toDate) {
            query += ` AND DATE(c.created_at) <= ?`;
            params.push(toDate);
        }

        query += ` ORDER BY c.created_at DESC`;

        const [complaints] = await pool.execute(query, params);

        res.json({ complaints });
    } catch (err) {
        console.error("QC DASHBOARD ERROR:", err);
        res.status(500).json({
            message: "Failed to load QC dashboard",
            error: err.message
        });
    }
};

/* ============================================================= */
/*                QC ASSESSMENT VIEW                             */
/* ============================================================= */

export const getQcAssessmentView = async (req, res) => {
    try {
        const { code } = req.params;

        // Get complaint details
        const [complaintRows] = await pool.execute(
            `SELECT * FROM complaints WHERE complaint_code = ?`,
            [code]
        );

        if (complaintRows.length === 0) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        const complaint = complaintRows[0];

        // Get warehouse assessment details
        const [assessmentRows] = await pool.execute(
            `SELECT * FROM warehouse_assessments WHERE complaint_code = ?`,
            [code]
        );

        const assessment = assessmentRows.length > 0 ? assessmentRows[0] : null;

        // Get qc assessment details
        const [qcRows] = await pool.execute(
            `SELECT * FROM qc_assessments WHERE complaint_code = ?`,
            [code]
        );
        const qc = qcRows.length > 0 ? qcRows[0] : null;

        // Get report details
        const [reportRows] = await pool.execute(
            `SELECT * FROM complaint_reports WHERE complaint_code = ?`,
            [code]
        );
        const report = reportRows.length > 0 ? reportRows[0] : null;

        // Parse JSON documents if exists
        if (assessment && assessment.documents) {
            try {
                assessment.documents = JSON.parse(assessment.documents);
            } catch (e) {
                assessment.documents = [];
            }
        }

        res.json({ complaint, assessment, qc, report });
    } catch (err) {
        console.error("QC ASSESSMENT VIEW ERROR:", err);
        res.status(500).json({
            message: "Failed to load QC assessment",
            error: err.message
        });
    }
};

/* ============================================================= */
/*                QC SAMPLE RECEIVED                             */
/* ============================================================= */

export const postQcSampleReceived = async (req, res) => {
    try {
        const { complaint_code } = req.body;

        if (!complaint_code) {
            return res.status(400).json({ message: "Complaint code is required" });
        }

        // Update complaint status to SAMPLE_RECEIVED_QC
        await pool.execute(
            `UPDATE complaints SET status = 'SAMPLE_RECEIVED_QC' WHERE complaint_code = ?`,
            [complaint_code]
        );

        // Insert into qc_assessments table
        await pool.execute(
            `INSERT INTO qc_assessments (id, complaint_code) VALUES (UUID(), ?)`,
            [complaint_code]
        );

        res.json({
            message: "Sample received successfully",
            status: "SAMPLE_RECEIVED_QC"
        });
    } catch (err) {
        console.error("QC SAMPLE RECEIVED ERROR:", err);
        res.status(500).json({
            message: "Failed to receive sample",
            error: err.message
        });
    }
};

/* ============================================================= */
/*                QC REPORT VIEW                                 */
/* ============================================================= */

export const getQcReportView = async (req, res) => {
    try {
        const { code } = req.params;

        // Get complaint details
        const [complaintRows] = await pool.execute(
            `SELECT * FROM complaints WHERE complaint_code = ?`,
            [code]
        );

        if (complaintRows.length === 0) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        const complaint = complaintRows[0];

        // Get report from complaint_reports table (complaint_code mapping)
        const [reportRows] = await pool.execute(
            `SELECT * FROM complaint_reports WHERE complaint_code = ?`,
            [code]
        );

        const report = reportRows.length > 0 ? reportRows[0] : null;

        res.json({ complaint, report });
    } catch (err) {
        console.error("QC REPORT VIEW ERROR:", err);
        res.status(500).json({
            message: "Failed to load report",
            error: err.message
        });
    }
};

/* ============================================================= */
/*                QC REPORT RECEIVED                             */
/* ============================================================= */

export const postQcReportReceived = async (req, res) => {
    try {
        const { complaint_code } = req.body;

        if (!complaint_code) {
            return res.status(400).json({ message: "Complaint code is required" });
        }

        // Update complaint_reports with received_at
        await pool.execute(
            `UPDATE complaint_reports 
             SET received_at = CURRENT_TIMESTAMP 
             WHERE complaint_code = ?`,
            [complaint_code]
        );

        // Update qc_assessments with report_received_date (plural)
        await pool.execute(
            `UPDATE qc_assessments 
             SET report_received_date = CURRENT_TIMESTAMP 
             WHERE complaint_code = ?`,
            [complaint_code]
        );

        // Update complaint status to REPORT_RECEIVED
        await pool.execute(
            `UPDATE complaints 
             SET status = 'REPORT_RECEIVED' 
             WHERE complaint_code = ?`,
            [complaint_code]
        );

        res.json({
            message: "Report received successfully",
            status: "REPORT_RECEIVED"
        });
    } catch (err) {
        console.error("QC REPORT RECEIVED ERROR:", err);
        res.status(500).json({
            message: "Failed to mark report as received",
            error: err.message
        });
    }
};

/* ============================================================= */
/*                DOWNLOAD REPORT PDF (PROXY)                    */
/* ============================================================= */

export const downloadReportPdf = async (req, res) => {
    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ message: "PDF URL is required" });
        }

        // Fetch the PDF from the external URL
        const response = await fetch(url);

        if (!response.ok) {
            return res.status(response.status).json({ message: "Failed to fetch PDF" });
        }

        // Get the content type
        const contentType = response.headers.get('content-type') || 'application/pdf';

        // Set headers for download
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');

        // Pipe the response body to our response
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));

    } catch (err) {
        console.error("DOWNLOAD PDF ERROR:", err);
        res.status(500).json({
            message: "Failed to download PDF",
            error: err.message
        });
    }
};

/* ============================================================= */
/*                QC REVIEW (APPROVE/REJECT)                      */
/* ============================================================= */

export const postQcReview = async (req, res) => {
    try {
        const { complaint_code, status, remarks } = req.body;

        if (!complaint_code || !status) {
            return res.status(400).json({ message: "Complaint code and status are required" });
        }

        if (status === 'Approve') {
            // Update qc_assessments and complaints status
            await pool.execute(
                `UPDATE qc_assessments SET status = ? WHERE complaint_code = ?`,
                ['Approve', complaint_code]
            );
            await pool.execute(
                `UPDATE complaints SET status = ? WHERE complaint_code = ?`,
                ['APPROVE_BY_QC', complaint_code]
            );
        } else if (status === 'Reject') {
            // Update both tables and set closure timestamps + REJECT_BY_QC status
            await pool.execute(
                `UPDATE qc_assessments 
                 SET status = ?, 
                     remarks = ?, 
                     complaint_close_date = CURRENT_TIMESTAMP 
                 WHERE complaint_code = ?`,
                ['Reject', remarks || null, complaint_code]
            );

            await pool.execute(
                `UPDATE complaints 
                 SET complaint_close_date = CURRENT_TIMESTAMP,
                     status = ?
                 WHERE complaint_code = ?`,
                ['REJECT_BY_QC', complaint_code]
            );
        }

        res.json({
            message: `Complaint ${status}ed successfully`,
            status: status
        });
    } catch (err) {
        console.error("QC REVIEW ERROR:", err);
        res.status(500).json({
            message: "Failed to process QC review",
            error: err.message
        });
    }
};

/* ============================================================= */
/*                QC FULL ASSESSMENT DETAILS                     */
/* ============================================================= */

export const getFullAssessmentDetails = async (req, res) => {
    try {
        const { code } = req.params;

        // Get complaint details
        const [complaintRows] = await pool.execute(
            `SELECT * FROM complaints WHERE complaint_code = ?`,
            [code]
        );
        if (complaintRows.length === 0) return res.status(404).json({ message: "Complaint not found" });
        const complaint = complaintRows[0];

        // Get warehouse assessment details
        const [whRows] = await pool.execute(
            `SELECT * FROM warehouse_assessments WHERE complaint_code = ?`,
            [code]
        );
        const warehouse = whRows.length > 0 ? whRows[0] : null;

        // Get qc assessment details
        const [qcRows] = await pool.execute(
            `SELECT * FROM qc_assessments WHERE complaint_code = ?`,
            [code]
        );
        const qc = qcRows.length > 0 ? qcRows[0] : null;

        // Get report details
        const [reportRows] = await pool.execute(
            `SELECT * FROM complaint_reports WHERE complaint_code = ?`,
            [code]
        );
        const report = reportRows.length > 0 ? reportRows[0] : null;

        res.json({ complaint, warehouse, qc, report });
    } catch (err) {
        console.error("FULL ASSESSMENT ERROR:", err);
        res.status(500).json({ message: "Failed to load full details", error: err.message });
    }
};

/* ============================================================= */
/*                QC FINAL RESOLVE                               */
/* ============================================================= */

export const postQcResolve = async (req, res) => {
    try {
        const { complaint_code, remarks } = req.body;

        if (!complaint_code) {
            return res.status(400).json({ message: "Complaint code is required" });
        }

        // Update qc_assessments: set status to Approve, add remarks and close date
        await pool.execute(
            `UPDATE qc_assessments 
             SET remarks = ?, 
                 status = 'Approve',
                 complaint_close_date = CURRENT_TIMESTAMP 
             WHERE complaint_code = ?`,
            [remarks || null, complaint_code]
        );

        // Update complaints: set status to RESOLVED and update close date
        await pool.execute(
            `UPDATE complaints 
             SET status = 'RESOLVED', 
                 complaint_close_date = CURRENT_TIMESTAMP 
             WHERE complaint_code = ?`,
            [complaint_code]
        );

        res.json({ message: "Complaint resolved and closed successfully", status: "RESOLVED" });
    } catch (err) {
        console.error("FINAL RESOLVE ERROR:", err);
        res.status(500).json({ message: "Failed to resolve complaint", error: err.message });
    }
};

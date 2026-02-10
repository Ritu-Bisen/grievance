import pool from "../config/db.js";
import { randomUUID } from "crypto";

/* ============================================================= */
/*                    CREATE COMPLAINT                           */
/* ============================================================= */

export const createComplaintService = async (body, documents) => {
  let prefix = "CMP-OTH"; // Default
  const type = body.complaint_type; // ADR, PHYSICAL, QUALITY

  if (type === "ADR") prefix = "CMP-ADR";
  else if (type === "PHYSICAL") prefix = "CMP-PHY";
  else if (type === "QUALITY") prefix = "CMP-PQ";

  const uniqueId = randomUUID().slice(0, 8).toUpperCase();
  const code = `${prefix}-${uniqueId}`;

  const sql = `
    INSERT INTO complaints (
      complaint_code, complaint_type, category,
      facility_name, facility_address,
      item_code, item_name,
      batch_no, warehouse_code, firm_name,
      opd_slip,
      mfg_date, exp_date, purchase_date, quantity_received,
      affected_quantity, description, documents
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  await pool.execute(sql, [
    code,
    body.complaint_type,
    body.category,

    body.facility.name,
    body.facility.address,

    body.item.code,
    body.item.name,

    body.batch.batchNo,
    body.batch.warehouse_code,
    body.batch.firm_name,
    body.opd_slip,
    body.batch.mfg,
    body.batch.exp,
    body.batch.purchase,
    body.batch.quantity,

    body.affected_quantity,
    body.description,
    JSON.stringify(documents)
  ]);

  return code;
};

/* ============================================================= */
/*                 FACILITY DASHBOARD FILTER                     */
/* ============================================================= */

export const dashboardService = async (filters) => {
  let sql = "SELECT * FROM complaints WHERE facility_name = ?";
  const params = [filters.facility_name]; // 🔥 MAIN FIX

  if (filters.complaintCode) {
    sql += " AND complaint_code LIKE ?";
    params.push(`%${filters.complaintCode}%`);
  }

  if (filters.status) {
    sql += " AND status = ?";
    params.push(filters.status);
  }

  if (filters.fromDate) {
    sql += " AND DATE(created_at) >= ?";
    params.push(filters.fromDate);
  }

  if (filters.toDate) {
    sql += " AND DATE(created_at) <= ?";
    params.push(filters.toDate);
  }

  if (filters.complaintType) {
    sql += " AND complaint_type = ?";
    params.push(filters.complaintType);
  }

  sql += " ORDER BY created_at DESC";

  const [rows] = await pool.execute(sql, params);
  return rows;
};

/* ============================================================= */
/*              DISPATCH SAMPLE FROM FACILITY                    */
/* ============================================================= */

export const dispatchFromFacilityService = async (complaintCode, facilityName) => {
  const [rows] = await pool.execute(
    "SELECT status, facility_name FROM complaints WHERE complaint_code = ?",
    [complaintCode]
  );

  if (rows.length === 0) throw new Error("Complaint not found");

  if (rows[0].facility_name !== facilityName)
    throw new Error("Unauthorized");

  if (rows[0].status !== "SUBMITTED")
    throw new Error("Dispatch not allowed");

  await pool.execute(
    "UPDATE complaints SET status = ?, date_of_dispatch = CURRENT_TIMESTAMP WHERE complaint_code = ?",
    ["SAMPLE_DISPATCHED_FACILITY", complaintCode]
  );
};

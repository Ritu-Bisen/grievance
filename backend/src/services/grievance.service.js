import pool from "../config/db.js";
import { randomUUID } from "crypto";

export const createComplaintService = async (body, documents) => {
  const code = "CMP-" + randomUUID().slice(0, 8).toUpperCase();

  const sql = `
    INSERT INTO complaints (
      complaint_code, complaint_type, category,
      facility_id, facility_name, facility_address,
      item_code, item_name,
      batch_no, warehouse_batch,
      mfg_date, exp_date, purchase_date, quantity_received,
      affected_quantity, description, documents
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  await pool.execute(sql, [
    code,
    body.complaint_type,
    body.category,
    body.facility.id,
    body.facility.name,
    body.facility.address,
    body.item.code,
    body.item.name,
    body.batch.batchNo,
    body.batch.warehouseBatch,
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

export const dashboardService = async (filters) => {
  let sql = "SELECT * FROM complaints WHERE 1=1";
  const params = [];

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

  sql += " ORDER BY created_at DESC";

  const [rows] = await pool.execute(sql, params);
  return rows;
};
export const dispatchFromFacilityService = async (complaintCode) => {
  // get current status
  const [rows] = await pool.execute(
    "SELECT status FROM complaints WHERE complaint_code = ?",
    [complaintCode]
  );

  if (rows.length === 0) {
    throw new Error("Complaint not found");
  }

  if (rows[0].status !== "SUBMITTED") {
    throw new Error("Dispatch not allowed");
  }

  // update status
  await pool.execute(
    "UPDATE complaints SET status = ? WHERE complaint_code = ?",
    ["SAMPLE_DISPATCHED_FACILITY", complaintCode]
  );
};


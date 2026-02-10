import pool from "../config/db.js";

/* ================= WAREHOUSE DASHBOARD SERVICE ================= */

export const warehouseDashboardService = async (query, user) => {
  const {
    complaintCode,
    status,
    fromDate,
    toDate,
    complaintType
  } = query;

  // ✅ FIX HERE
  const { warehouse_code } = user;

  // 🔒 Security check
  if (!warehouse_code) {
    console.error("USER CONTEXT:", user); // 🔥 debug help
    throw new Error("Warehouse code missing in user context");
  }

  let sql = `
    SELECT
      complaint_code,
      complaint_type,
      category,
      facility_name,
      item_name,
      batch_no,
      warehouse_code,
      status,
      created_at,
      resolved_at
    FROM complaints
    WHERE warehouse_code = ?
  `;

  const params = [warehouse_code];

  /* ---------- OPTIONAL FILTERS ---------- */

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
  return rows;
};

import pool from "../config/db.js";

export const warehouseDashboardService = async (query, user) => {
  const { complaintCode, status, fromDate, toDate, complaintType } = query;
  const { warehouseCode } = user;

  let sql = `
    SELECT *
    FROM complaints
    WHERE warehouse_code = ?
  `;

  const params = [warehouseCode];

  if (complaintType) {
    sql += " AND complaint_type = ?";
    params.push(complaintType);
  }

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  if (complaintCode) {
    sql += " AND complaint_code LIKE ?";
    params.push(`%${complaintCode}%`);
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

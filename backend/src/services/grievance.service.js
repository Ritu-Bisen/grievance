const db = require("../config/db");

/**
 * Complaint User Dashboard with Filters
 */
exports.getComplaintUserDashboard = (userId, filters, callback) => {
  let sql = `
    SELECT * FROM complaints
    WHERE user_id = ?
  `;

  const values = [userId];

  // 🔍 Complaint ID filter
  if (filters.complaintCode) {
    sql += " AND complaint_code LIKE ?";
    values.push(`%${filters.complaintCode}%`);
  }

  // 📌 Status filter
  if (filters.status) {
    sql += " AND status = ?";
    values.push(filters.status);
  }

  // 📅 Date filter
  if (filters.fromDate && filters.toDate) {
    sql += " AND DATE(created_at) BETWEEN ? AND ?";
    values.push(filters.fromDate, filters.toDate);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, values, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

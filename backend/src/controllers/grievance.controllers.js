const grievanceService = require("../services/grievance.service");

/**
 * Complaint User Dashboard
 */
exports.complaintUserDashboard = (req, res) => {
  const userId = 1; // TEMP

  const filters = {
    complaintCode: req.query.complaintCode || null,
    status: req.query.status || null,
    fromDate: req.query.fromDate || null,
    toDate: req.query.toDate || null
  };

  grievanceService.getComplaintUserDashboard(
    userId,
    filters,
    (err, complaints) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to load complaint dashboard"
        });
      }

      return res.json({
        message: "Complaint dashboard loaded",
        complaints
      });
    }
  );
};

/**
 * Raise Complaint – STEP 1 ONLY
 * User selects complaint type here
 */
exports.getComplaintTypes = (req, res) => {
  return res.status(200).json({
    message: "Select complaint type",
    complaintTypes: [
      {
        code: "PHYSICAL_DAMAGE",
        title: "Physical Damage"
      },
      {
        code: "ADR_REACTION",
        title: "ADR Reaction"
      },
      {
        code: "POOR_QUALITY",
        title: "Poor Quality"
      }
    ]
  });
};

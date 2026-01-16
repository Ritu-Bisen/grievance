const express = require("express");
const router = express.Router();
const grievanceController = require("../controllers/grievance.controllers");

/**
 * Complaint User Dashboard
 */
router.get(
  "/complaint-user/dashboard",
  grievanceController.complaintUserDashboard
);

/**
 * Raise Complaint – ONLY TYPE SELECTION
 */
router.get(
  "/complaint-user/complaint-types",
  grievanceController.getComplaintTypes
);

module.exports = router;

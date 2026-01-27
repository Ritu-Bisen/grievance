import express from "express";
import multer from "multer";

import {
  createComplaint,
  complaintDashboard,
  viewComplaint,
  dispatchFromFacility
} from "../controllers/grievance.controllers.js";

import {
  warehouseDashboard,
  receiveSampleWarehouse,
  approveWarehouse,
  rejectWarehouse,
  submitWarehouseAssessment,
  viewWarehouseAssessment,
  resolveComplaint,          // 🔥 ADDED
  dispatchSample             // 🔥 ADDED
} from "../controllers/warehouse.controllers.js";

import { assessmentUpload } from "../middlewares/assessmentUpload.js";
import Auth from "../middlewares/Auth.js";   // ✅ REQUIRED for dashboard

const router = express.Router();

/* ============================================================= */
/*                   MULTER (COMPLAINT DOCS)                     */
/* ============================================================= */

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    }
  })
});

/* ============================================================= */
/*                 FACILITY / COMPLAINT ROUTES                   */
/* ============================================================= */

// Create complaint (with documents)
router.post(
  "/complaint-user/create",
  upload.array("documents"),
  createComplaint
);

// View complaint (details + documents)
router.get(
  "/complaint-user/view/:code",
  viewComplaint
);

// Complaint dashboard (user)
router.get(
  "/complaint-user/dashboard",
  complaintDashboard
);

// Download complaint document
router.get(
  "/complaint-user/download/:filename",
  (req, res) => {
    const { filename } = req.params;
    const filePath = `uploads/${filename}`;
    res.download(filePath);
  }
);

// Dispatch sample from facility
router.post(
  "/complaint-user/dispatch-facility",
  dispatchFromFacility
);

/* ============================================================= */
/*                     WAREHOUSE ROUTES                          */
/* ============================================================= */

// ✅ Warehouse dashboard (Auth REQUIRED)
router.get(
  "/warehouse/dashboard",
  Auth,
  warehouseDashboard
);

// ✅ Receive sample at warehouse
router.post(
  "/warehouse/receive-sample",
  receiveSampleWarehouse
);

// Approve complaint (warehouse)
router.post(
  "/warehouse/approve",
  approveWarehouse
);

// Reject complaint (warehouse)
router.post(
  "/warehouse/reject",
  rejectWarehouse
);

/* ============================================================= */
/*                 WAREHOUSE ASSESSMENT ROUTES                   */
/* ============================================================= */

// Submit warehouse assessment (PHYSICAL / ADR / QUALITY)
// max 5 documents
router.post(
  "/warehouse/assessment/submit",
  assessmentUpload.array("documents", 5),
  submitWarehouseAssessment
);

// View warehouse assessment
// (complaint details + assessment + uploaded documents)
router.get(
  "/warehouse/assessment/view/:complaintCode",
  viewWarehouseAssessment
);

/* ============================================================= */
/*              FINAL WAREHOUSE ACTION ROUTES 🔥                 */
/* ============================================================= */

// Resolve Physical Complaint
router.post(
  "/warehouse/resolve",
  resolveComplaint
);

// Dispatch Sample (ADR / QUALITY)
router.post(
  "/warehouse/dispatch",
  dispatchSample
);

export default router;

import express from "express";
import multer from "multer";

/* ================= CONTROLLERS ================= */

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
  resolveComplaint,
  dispatchSample
} from "../controllers/warehouse.controllers.js";

/* ================= MIDDLEWARES ================= */

import { assessmentUpload } from "../middlewares/assessmentUpload.js";
import { authenticate as Auth } from "../middlewares/Auth.js";

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

// ✅ Create complaint (FACILITY only)
router.post(
  "/complaint-user/create",
  Auth,                         // 🔥 REQUIRED
  upload.array("documents"),
  createComplaint
);

// ✅ Complaint dashboard (FACILITY only)
router.get(
  "/complaint-user/dashboard",
  Auth,                         // 🔥 THIS FIXES req.user undefined
  complaintDashboard
);

// View complaint (logged user)
router.get(
  "/complaint-user/view/:code",
  Auth,
  viewComplaint
);

// Download complaint document
router.get(
  "/complaint-user/download/:filename",
  
  (req, res) => {
    const { filename } = req.params;
    res.download(`uploads/${filename}`);
  }
);

// Dispatch sample from facility
router.post(
  "/complaint-user/dispatch-facility",
  Auth,
  dispatchFromFacility
);

/* ============================================================= */
/*                     WAREHOUSE ROUTES                          */
/* ============================================================= */

router.get(
  "/warehouse/dashboard",
  Auth,
  warehouseDashboard
);

router.post(
  "/warehouse/receive-sample",
  Auth,
  receiveSampleWarehouse
);

router.post(
  "/warehouse/approve",
  Auth,
  approveWarehouse
);

router.post(
  "/warehouse/reject",
  Auth,
  rejectWarehouse
);

/* ============================================================= */
/*                 WAREHOUSE ASSESSMENT ROUTES                   */
/* ============================================================= */

router.post(
  "/warehouse/assessment/submit",
  Auth,
  assessmentUpload.array("documents", 5),
  submitWarehouseAssessment
);

router.get(
  "/warehouse/assessment/view/:complaintCode",
  Auth,
  viewWarehouseAssessment
);

/* ============================================================= */
/*              FINAL WAREHOUSE ACTION ROUTES                    */
/* ============================================================= */

router.post(
  "/warehouse/resolve",
  Auth,
  resolveComplaint
);

router.post(
  "/warehouse/dispatch",
  Auth,
  dispatchSample
);
// Download warehouse assessment document (NO AUTH)
router.get(
  "/warehouse/assessment/download/:filename",
  (req, res) => {
    const { filename } = req.params;
    const filePath = `uploads/assessment/${filename}`;
    res.download(filePath);
  }
);

export default router;

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

import {
  adminDashboard,
  adminReportView,
  avgHandlingTime,
  resolutionTimeGraph
} from "../controllers/admin.controllers.js";

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

router.post(
  "/complaint-user/create",
  Auth,
  upload.array("documents"),
  createComplaint
);

router.get(
  "/complaint-user/dashboard",
  Auth,
  complaintDashboard
);

router.get(
  "/complaint-user/view/:code",
  Auth,
  viewComplaint
);

router.get(
  "/complaint-user/download/:filename",
  (req, res) => {
    const { filename } = req.params;
    res.download(`uploads/${filename}`);
  }
);

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

router.get(
  "/warehouse/assessment/download/:filename",
  (req, res) => {
    const { filename } = req.params;
    res.download(`uploads/assessment/${filename}`);
  }
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

/* ============================================================= */
/*                        ADMIN ROUTES                           */
/* ============================================================= */

router.get(
  "/admin/dashboard",
  Auth,
  adminDashboard
);

router.get(
  "/admin/report/view/:complaintCode",
  Auth,
  adminReportView
);

/* 🔥 AVG HANDLING TIME GRAPH */
router.get(
  "/admin/avg-handling-time",
  Auth,
  avgHandlingTime
);

/* 🔥 RESOLUTION TIME GRAPH */
router.get(
  "/admin/resolution-time-graph",
  Auth,
  resolutionTimeGraph
);

export default router;

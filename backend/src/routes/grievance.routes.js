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
  rejectWarehouse
} from "../controllers/warehouse.controllers.js";

import Auth from "../middlewares/Auth.js";

const router = express.Router();

/* ---------------- MULTER ---------------- */

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    }
  })
});

/* ---------------- FACILITY / COMPLAINT ROUTES ---------------- */

// Create complaint
router.post(
  "/complaint-user/create",
  upload.array("documents"),
  createComplaint
);

// View complaint
router.get(
  "/complaint-user/view/:code",
  viewComplaint
);

// Complaint dashboard (user)
router.get(
  "/complaint-user/dashboard",
  complaintDashboard
);

// Download uploaded file
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

/* ---------------- WAREHOUSE ROUTES ---------------- */

// Warehouse dashboard
router.get(
  "/warehouse/dashboard",
  Auth,
  warehouseDashboard
);

// Receive sample at warehouse
router.post(
  "/warehouse/receive-sample",
  receiveSampleWarehouse
);

// ✅ FIXED: Approve complaint (warehouse)
router.post(
  "/warehouse/approve",
  approveWarehouse
);

// ✅ FIXED: Reject complaint (warehouse)
router.post(
  "/warehouse/reject",
  rejectWarehouse
);

export default router;

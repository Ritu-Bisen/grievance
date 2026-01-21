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
  receiveSampleWarehouse
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

router.post(
  "/complaint-user/create",
  upload.array("documents"),
  createComplaint
);

router.get(
  "/complaint-user/view/:code",
  viewComplaint
);

router.get(
  "/complaint-user/dashboard",
  complaintDashboard
);

router.get(
  "/complaint-user/download/:filename",
  (req, res) => {
    const { filename } = req.params;
    const filePath = `uploads/${filename}`;
    res.download(filePath);
  }
);

router.post(
  "/complaint-user/dispatch-facility",
  dispatchFromFacility
);

/* ---------------- WAREHOUSE ROUTES (ADDED) ---------------- */

router.get(
  "/warehouse/dashboard",
  Auth,
  warehouseDashboard
);
router.post(
  "/warehouse/receive-sample",
  receiveSampleWarehouse
);


export default router;

import express from "express";
import multer from "multer";
import {
  createComplaint,
  complaintDashboard
} from "../controllers/grievance.controllers.js";
import { viewComplaint } from "../controllers/grievance.controllers.js";


const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    }
  })
});

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
router.get("/complaint-user/download/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = `uploads/${filename}`;

  res.download(filePath);
});


export default router;

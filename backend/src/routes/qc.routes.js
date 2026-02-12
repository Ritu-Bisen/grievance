import express from "express";
import { assessmentUpload } from "../middlewares/assessmentUpload.js";
import { authenticate } from "../middlewares/Auth.js";
import {
    getQcDashboard,
    getQcAssessmentView,
    postQcSampleReceived,
    getQcReportView,
    postQcReportReceived,
    downloadReportPdf,
    postQcReview,
    getFullAssessmentDetails,
    postQcResolve
} from "../controllers/qc.controllers.js";

const router = express.Router();

/* ============================================================= */
/*                       QC ROUTES                               */
/* ============================================================= */

router.get("/qc/dashboard", authenticate, getQcDashboard);
router.get("/qc/assessment/view/:code", authenticate, getQcAssessmentView);
router.post("/qc/receive-sample", authenticate, postQcSampleReceived);
router.get("/qc/report/view/:code", authenticate, getQcReportView);
router.post("/qc/receive-report", authenticate, postQcReportReceived);
router.get("/qc/download-pdf", downloadReportPdf);
router.post("/qc/review", authenticate, postQcReview);
router.get("/qc/full-details/:code", authenticate, getFullAssessmentDetails);
router.post("/qc/resolve", authenticate, assessmentUpload.single("document"), postQcResolve);

export default router;

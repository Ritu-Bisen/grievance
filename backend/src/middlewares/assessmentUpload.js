import multer from "multer";

const storage = multer.diskStorage({
  destination: "uploads/assessment/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

export const assessmentUpload = multer({
  storage,
  limits: { files: 5 }
});

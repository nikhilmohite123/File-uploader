import { Router } from "express";
import AuthController from "../controller/AuthController.js";
import {uploadController } from "../controller/uploadController.js"     
import authMiddleware from "../middlware/Authenticate.js";
import handleMulterErrors from '../middlware/multerSizeChecker.js'
import { upload } from "../config/multerConfig.js";


const router = Router();

// authetication Routes
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);

// protecte fileUploads Route

router.post(
  "/upload",
  authMiddleware,
  (req, res, next) => {
    upload.single("file")(req, res, function (err) {
      if (err) {
        // handle multer errors here
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File too large. Max 5MB allowed." });
          }
          return res.status(400).json({ message: "Multer upload error", error: err.message });
        }
        return res.status(500).json({ message: "Unexpected upload error", error: err.message });
      }
      next();
    });
  },
  uploadController.uploadFile
);

router.get('/files/', authMiddleware, uploadController.index);
router.get('/files/:id', authMiddleware, uploadController.getFileById);
export default router;
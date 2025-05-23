import { upload } from "../config/multerConfig.js";
import multer from "multer";


const handleMulterErrors = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      const errorMessages = {
        LIMIT_FILE_SIZE: "File too large. Max 5MB allowed.",
        LIMIT_UNEXPECTED_FILE: "Unexpected file upload error.",
      };
      const message = errorMessages[err.code] || "File upload error";
      return res.status(400).json({ message });
    }

    if (err) {
      // Other unknown errors
      return res.status(500).json({ message: "Unexpected error during file upload", error: err.message });
    }

    // Proceed to controller if no error
    next();
  });
};
export default handleMulterErrors;
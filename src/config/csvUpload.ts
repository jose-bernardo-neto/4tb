import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { AppError } from "../errors/AppError";
import { env } from "./env";

const allowed = new Set(["text/csv", "application/csv", "text/plain", "application/vnd.ms-excel"]);

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_BYTES },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const ext = file.originalname.toLowerCase().endsWith(".csv");
    if (allowed.has(file.mimetype) || ext) {
      cb(null, true);
      return;
    }
    cb(new AppError("Envie um ficheiro CSV.", 400));
  },
});

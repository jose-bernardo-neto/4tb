import fs from "node:fs";
import path from "node:path";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { AppError } from "../errors/AppError";
import { env } from "./env";

const allowedMimeTypes = new Set(["application/pdf", "image/png", "image/jpeg", "image/jpg"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
    cb(null, env.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const stamp = Date.now();
    cb(null, `${stamp}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new AppError("Tipo de ficheiro não permitido. Use PDF, PNG ou JPG.", 400));
    return;
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_UPLOAD_BYTES },
});

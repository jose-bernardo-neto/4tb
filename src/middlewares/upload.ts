import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { csvUpload } from "../config/csvUpload";
import { upload } from "../config/multer";
import { AppError } from "../errors/AppError";
import { setFlash } from "./flash";

function handleMulter(req: Request, res: Response, next: NextFunction, err: unknown): void {
  if (!err) {
    next();
    return;
  }

  let message = "Falha no envio do ficheiro.";
  if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
    message = "O ficheiro excede o tamanho máximo permitido.";
  } else if (err instanceof AppError) {
    message = err.message;
  }

  setFlash(res, "error", message);
  const fallback = req.headers.referer ?? "/anos-letivos";
  res.redirect(fallback);
}

export function uploadAttachments(req: Request, res: Response, next: NextFunction): void {
  upload.array("attachments", 8)(req, res, (err: unknown) => handleMulter(req, res, next, err));
}

export function uploadSingleFile(req: Request, res: Response, next: NextFunction): void {
  upload.single("file")(req, res, (err: unknown) => handleMulter(req, res, next, err));
}

export function uploadCsvFile(req: Request, res: Response, next: NextFunction): void {
  csvUpload.single("file")(req, res, (err: unknown) => handleMulter(req, res, next, err));
}

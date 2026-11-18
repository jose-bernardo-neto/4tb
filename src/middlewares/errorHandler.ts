import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { AppError } from "../errors/AppError";

export function notFound(_req: Request, res: Response): void {
  res.status(404).render("pages/error", {
    title: "Não encontrado",
    status: 404,
    message: "A página pedida não existe.",
    appName: res.locals.appName ?? "4TB",
    currentPath: res.locals.currentPath ?? "",
  });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "O ficheiro excede o tamanho máximo permitido."
        : "Falha no envio do ficheiro.";
    res.status(400).render("pages/error", {
      title: "Erro",
      status: 400,
      message,
      appName: res.locals.appName ?? "4TB",
      currentPath: res.locals.currentPath ?? "",
    });
    return;
  }

  const isAppError = err instanceof AppError;
  const status = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : "Erro interno do servidor.";

  if (!isAppError) {
    console.error(err);
  }

  res.status(status).render("pages/error", {
    title: status >= 500 ? "Erro interno" : "Erro",
    status,
    message,
    appName: res.locals.appName ?? "4TB",
    currentPath: res.locals.currentPath ?? "",
  });
}

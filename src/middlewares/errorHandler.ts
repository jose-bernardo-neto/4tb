import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { AppError } from "../errors/AppError";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderOrFallback(
  res: Response,
  status: number,
  title: string,
  message: string,
): void {
  const appName = res.locals.appName ?? "4TB";
  const currentPath = res.locals.currentPath ?? "";
  res.status(status);
  res.render(
    "pages/error",
    { title, status, message, appName, currentPath },
    (renderErr, html) => {
      if (renderErr || !html) {
        console.error(renderErr);
        res.type("html").send(`<!doctype html>
<html lang="pt">
  <head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
  <body>
    <h1>${status} · ${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <p><a href="/login">Voltar ao login</a></p>
  </body>
</html>`);
        return;
      }
      res.send(html);
    },
  );
}

export function notFound(_req: Request, res: Response): void {
  renderOrFallback(res, 404, "Não encontrado", "A página pedida não existe.");
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "O ficheiro excede o tamanho máximo permitido."
        : "Falha no envio do ficheiro.";
    renderOrFallback(res, 400, "Erro", message);
    return;
  }

  const isAppError = err instanceof AppError;
  const status = isAppError ? err.statusCode : 500;
  const message = isAppError
    ? err.message
    : err instanceof Error
      ? err.message
      : "Erro interno do servidor.";

  if (!isAppError) {
    console.error(err);
  }

  renderOrFallback(res, status, status >= 500 ? "Erro interno" : "Erro", message);
}

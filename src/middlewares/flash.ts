import { NextFunction, Request, Response } from "express";

const FLASH_COOKIE = "4tb_flash";

type FlashType = "success" | "error";

export function setFlash(res: Response, type: FlashType, message: string): void {
  res.cookie(FLASH_COOKIE, JSON.stringify({ type, message }), {
    httpOnly: true,
    maxAge: 60_000,
    sameSite: "lax",
  });
}

export function flashMiddleware(req: Request, res: Response, next: NextFunction): void {
  const raw = req.cookies?.[FLASH_COOKIE];
  if (raw) {
    try {
      res.locals.flash = JSON.parse(raw) as { type: FlashType; message: string };
    } catch {
      res.locals.flash = undefined;
    }
    res.clearCookie(FLASH_COOKIE);
  }
  next();
}

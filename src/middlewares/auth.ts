import { NextFunction, Request, Response } from "express";
import { authCookieOptions } from "../config/auth";
import { env } from "../config/env";
import { TokenService } from "../services/TokenService";

const tokens = new TokenService();

export function loadCurrentUser(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) {
    next();
    return;
  }

  try {
    req.user = tokens.verify(token);
    res.locals.currentUser = req.user;
  } catch {
    res.clearCookie(env.COOKIE_NAME, authCookieOptions());
  }

  next();
}

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction): void {
  const path = req.path ?? "";
  if (path === "/turma" || path.startsWith("/turma/")) {
    next();
    return;
  }

  if (!req.user) {
    res.redirect("/login");
    return;
  }

  next();
}

export function ensureGuest(req: Request, res: Response, next: NextFunction): void {
  if (req.user) {
    res.redirect("/");
    return;
  }

  next();
}

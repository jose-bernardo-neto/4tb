import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { authCookieOptions } from "../config/auth";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { asyncHandler } from "../middlewares/asyncHandler";
import { setFlash } from "../middlewares/flash";
import { User } from "../models/User";
import { AuthService } from "../services/AuthService";
import { TokenService } from "../services/TokenService";

export class AuthController {
  private readonly tokens = new TokenService();

  private authService(): AuthService {
    return new AuthService(AppDataSource.getRepository(User));
  }

  showLogin = asyncHandler((_req: Request, res: Response) => {
    res.render("pages/login", {
      title: "Entrar",
      guest: true,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const username = typeof req.body.username === "string" ? req.body.username : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    try {
      const user = await this.authService().login(username, password);
      const token = this.tokens.sign({ id: user.id, username: user.username });
      res.cookie(env.COOKIE_NAME, token, authCookieOptions());
      res.redirect("/");
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect("/login");
        return;
      }
      throw err;
    }
  });

  logout = asyncHandler((_req: Request, res: Response) => {
    res.clearCookie(env.COOKIE_NAME, authCookieOptions());
    res.redirect("/login");
  });
}

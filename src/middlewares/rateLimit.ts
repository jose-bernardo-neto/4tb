import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { setFlash } from "./flash";

export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === "test" ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    setFlash(res, "error", "Demasiadas tentativas de login. Aguarde alguns minutos.");
    if (typeof req.accepts === "function" && req.accepts("html")) {
      res.redirect("/login");
      return;
    }
    res.status(429).json({ message: "Demasiadas tentativas de login." });
  },
});

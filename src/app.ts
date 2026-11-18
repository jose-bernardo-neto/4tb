import path from "node:path";
import cookieParser from "cookie-parser";
import express from "express";
import { ensureReady } from "./config/bootstrap";
import { env } from "./config/env";
import { ROOT_DIR } from "./config/paths";
import { ensureAuthenticated, loadCurrentUser } from "./middlewares/auth";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import { flashMiddleware } from "./middlewares/flash";
import { router } from "./routes";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.set("view engine", "ejs");
  app.set("views", path.join(ROOT_DIR, "src", "views"));

  app.use((req, res, next) => {
    void ensureReady().then(() => next()).catch(next);
  });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.static(path.join(ROOT_DIR, "src", "public")));
  app.use(flashMiddleware);
  app.use(loadCurrentUser);

  app.use((req, res, next) => {
    res.locals.appName = "4TB";
    res.locals.currentPath = req.path;
    res.locals.isProd = env.isProd;
    next();
  });

  app.use(router);
  app.use(ensureAuthenticated);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

const app = createApp();
export default app;

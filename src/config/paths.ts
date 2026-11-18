import fs from "node:fs";
import path from "node:path";

export const ROOT_DIR = path.resolve(__dirname, "../..");

function firstExisting(candidates: string[], marker: string): string {
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, marker))) {
      return dir;
    }
  }
  return candidates[0];
}

export function resolveViewsDir(): string {
  return firstExisting(
    [
      path.join(ROOT_DIR, "src", "views"),
      path.join(process.cwd(), "src", "views"),
      path.join(__dirname, "..", "views"),
      path.join(__dirname, "..", "..", "src", "views"),
    ],
    path.join("pages", "login.ejs"),
  );
}

export function resolvePublicDir(): string {
  return firstExisting(
    [
      path.join(ROOT_DIR, "src", "public"),
      path.join(process.cwd(), "src", "public"),
      path.join(__dirname, "..", "public"),
      path.join(__dirname, "..", "..", "src", "public"),
    ],
    path.join("css", "style.css"),
  );
}

export function resolveFromRoot(target: string): string {
  return path.isAbsolute(target) ? target : path.resolve(ROOT_DIR, target);
}

export function ensureDirectories(): void {
  const dirs =
    Boolean(process.env.VERCEL)
      ? ["/tmp", "/tmp/uploads"]
      : [
          path.join(ROOT_DIR, "data"),
          path.join(ROOT_DIR, "uploads"),
          path.join(ROOT_DIR, "src", "public"),
        ];

  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

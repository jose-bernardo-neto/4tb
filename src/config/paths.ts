import fs from "node:fs";
import path from "node:path";

export const ROOT_DIR = path.resolve(__dirname, "../..");

export function resolveFromRoot(target: string): string {
  return path.isAbsolute(target) ? target : path.resolve(ROOT_DIR, target);
}

export function ensureDirectories(): void {
  const dirs =
    process.env.VERCEL === "1"
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

import dotenv from "dotenv";
import path from "node:path";
import { ROOT_DIR, resolveFromRoot } from "./paths";

dotenv.config({ path: path.join(ROOT_DIR, ".env") });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória em falta: ${name}`);
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const onVercel = Boolean(process.env.VERCEL);

function resolveDbPath(): string {
  if (process.env.DB_PATH === ":memory:") {
    return ":memory:";
  }
  if (onVercel) {
    return "/tmp/4tb.sqlite";
  }
  if (process.env.DB_PATH) {
    return resolveFromRoot(process.env.DB_PATH);
  }
  return resolveFromRoot("./data/4tb.sqlite");
}

export type DbDriver = "sqlite" | "supabase";

function resolveDbDriver(): DbDriver {
  const driver = process.env.DB_DRIVER ?? "sqlite";
  if (driver !== "sqlite" && driver !== "supabase") {
    throw new Error(`DB_DRIVER inválida: "${driver}" (use "sqlite" ou "supabase")`);
  }
  return driver;
}

const dbDriver = resolveDbDriver();
const supabaseDbUrl = process.env.SUPABASE_DB_URL;

if (dbDriver === "supabase" && !supabaseDbUrl) {
  throw new Error("Variável de ambiente obrigatória em falta: SUPABASE_DB_URL (DB_DRIVER=supabase)");
}

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: nodeEnv,
  isProd: nodeEnv === "production",
  DB_DRIVER: dbDriver,
  DB_PATH: resolveDbPath(),
  SUPABASE_DB_URL: supabaseDbUrl,
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "8h",
  COOKIE_NAME: process.env.COOKIE_NAME ?? "4tb_token",
  DEFAULT_ADMIN_USER: required("DEFAULT_ADMIN_USER"),
  DEFAULT_ADMIN_PASS: required("DEFAULT_ADMIN_PASS"),
  UPLOAD_DIR: onVercel ? "/tmp/uploads" : resolveFromRoot(process.env.UPLOAD_DIR ?? "./uploads"),
  MAX_UPLOAD_BYTES: Number(process.env.MAX_UPLOAD_BYTES ?? 5 * 1024 * 1024),
};

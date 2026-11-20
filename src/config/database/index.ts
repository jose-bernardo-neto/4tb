import type { env as appEnv } from "../env";
import type { DatabaseAdapter } from "./DatabaseAdapter";
import { SqliteDatabase } from "./SqliteDatabase";
import { SupabaseDatabase } from "./SupabaseDatabase";

type DatabaseEnv = Pick<typeof appEnv, "DB_DRIVER" | "DB_PATH" | "SUPABASE_DB_URL">;

export function createDatabaseAdapter(config: DatabaseEnv): DatabaseAdapter {
  switch (config.DB_DRIVER) {
    case "sqlite":
      return new SqliteDatabase(config.DB_PATH);
    case "supabase":
      if (!config.SUPABASE_DB_URL) {
        throw new Error("SUPABASE_DB_URL é obrigatória quando DB_DRIVER=supabase.");
      }
      return new SupabaseDatabase(config.SUPABASE_DB_URL);
  }
}

export type { DatabaseAdapter, SharedDatabaseOptions } from "./DatabaseAdapter";
export { SqliteDatabase } from "./SqliteDatabase";
export { SupabaseDatabase } from "./SupabaseDatabase";

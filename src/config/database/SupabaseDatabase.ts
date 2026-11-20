import type { DataSource } from "typeorm";
import type { DatabaseAdapter, SharedDatabaseOptions } from "./DatabaseAdapter";

export class SupabaseDatabase implements DatabaseAdapter {
  readonly name = "supabase";

  constructor(private readonly url: string) {}

  buildOptions(shared: SharedDatabaseOptions) {
    return {
      type: "postgres" as const,
      url: this.url,
      ssl: { rejectUnauthorized: false },
      ...shared,
    };
  }

  async afterInitialize(_dataSource: DataSource): Promise<void> {
    // Postgres não precisa de PRAGMAs; foreign keys já são aplicadas pelo servidor.
  }
}

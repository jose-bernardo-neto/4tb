import type { DataSource } from "typeorm";
import type { DatabaseAdapter, SharedDatabaseOptions } from "./DatabaseAdapter";

export class SqliteDatabase implements DatabaseAdapter {
  readonly name = "sqlite";

  constructor(private readonly dbPath: string) {}

  buildOptions(shared: SharedDatabaseOptions) {
    return {
      type: "sqlite" as const,
      database: this.dbPath,
      ...shared,
    };
  }

  async afterInitialize(dataSource: DataSource): Promise<void> {
    await dataSource.query("PRAGMA journal_mode = WAL;");
    await dataSource.query("PRAGMA foreign_keys = ON;");
  }
}

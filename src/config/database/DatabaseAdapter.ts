import type { DataSource, DataSourceOptions, EntitySchema, LoggerOptions } from "typeorm";

export interface SharedDatabaseOptions {
  entities: (Function | EntitySchema)[];
  migrations: (Function | string)[];
  synchronize: boolean;
  logging: LoggerOptions;
}

export interface DatabaseAdapter {
  readonly name: "sqlite" | "supabase";
  buildOptions(shared: SharedDatabaseOptions): DataSourceOptions;
  afterInitialize(dataSource: DataSource): Promise<void>;
}

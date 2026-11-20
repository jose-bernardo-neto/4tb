import type { QueryRunner } from "typeorm";

export function timestampType(queryRunner: QueryRunner): string {
  return queryRunner.connection.options.type === "sqlite" ? "datetime" : "timestamp";
}

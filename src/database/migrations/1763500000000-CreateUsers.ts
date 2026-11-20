import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { timestampType } from "./columnTypes";

export class CreateUsers1763500000000 implements MigrationInterface {
  name = "CreateUsers1763500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "username",
            type: "varchar",
            isUnique: true,
          },
          {
            name: "password_hash",
            type: "varchar",
          },
          {
            name: "created_at",
            type: timestampType(queryRunner),
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: timestampType(queryRunner),
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
  }
}

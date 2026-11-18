import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAnnouncementsAndFees1763500005000 implements MigrationInterface {
  name = "CreateAnnouncementsAndFees1763500005000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "announcements",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "title", type: "varchar" },
          { name: "body", type: "varchar" },
          { name: "date", type: "varchar" },
          { name: "semester_id", type: "integer" },
          { name: "created_at", type: "datetime", default: "CURRENT_TIMESTAMP" },
        ],
        foreignKeys: [
          {
            columnNames: ["semester_id"],
            referencedTableName: "semesters",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "fees",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "tipo", type: "varchar" },
          { name: "valor", type: "varchar" },
          { name: "prazo", type: "varchar" },
          { name: "obs", type: "varchar", default: "''" },
          { name: "semester_id", type: "integer" },
        ],
        foreignKeys: [
          {
            columnNames: ["semester_id"],
            referencedTableName: "semesters",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("fees");
    await queryRunner.dropTable("announcements");
  }
}

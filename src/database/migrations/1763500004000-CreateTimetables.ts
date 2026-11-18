import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTimetables1763500004000 implements MigrationInterface {
  name = "CreateTimetables1763500004000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "timetables",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "semester_id", type: "integer", isUnique: true },
          { name: "content", type: "varchar", default: "''" },
          { name: "stored_name", type: "varchar", isNullable: true },
          { name: "original_name", type: "varchar", isNullable: true },
          { name: "mime_type", type: "varchar", isNullable: true },
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
    await queryRunner.dropTable("timetables");
  }
}

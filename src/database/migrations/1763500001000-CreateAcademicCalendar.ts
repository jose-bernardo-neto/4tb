import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateAcademicCalendar1763500001000 implements MigrationInterface {
  name = "CreateAcademicCalendar1763500001000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "academic_years",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "label", type: "varchar", isUnique: true },
          { name: "created_at", type: "datetime", default: "CURRENT_TIMESTAMP" },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "semesters",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "academic_year_id", type: "integer" },
          { name: "period", type: "varchar" },
          { name: "status", type: "varchar", default: "'INATIVO'" },
        ],
        foreignKeys: [
          {
            columnNames: ["academic_year_id"],
            referencedTableName: "academic_years",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "semesters",
      new TableIndex({
        name: "IDX_semesters_year_period",
        columnNames: ["academic_year_id", "period"],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "disciplines",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "name", type: "varchar" },
          { name: "acronym", type: "varchar" },
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

    await queryRunner.createIndex(
      "disciplines",
      new TableIndex({
        name: "IDX_disciplines_semester_acronym",
        columnNames: ["semester_id", "acronym"],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("disciplines");
    await queryRunner.dropTable("semesters");
    await queryRunner.dropTable("academic_years");
  }
}

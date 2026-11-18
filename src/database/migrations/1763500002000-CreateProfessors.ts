import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateProfessors1763500002000 implements MigrationInterface {
  name = "CreateProfessors1763500002000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "professors",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "name", type: "varchar" },
          { name: "academic_degree", type: "varchar" },
          { name: "contact", type: "varchar" },
        ],
      }),
      true,
    );

    await queryRunner.query("DROP TABLE IF EXISTS disciplines");

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
          { name: "professor_id", type: "integer" },
        ],
        foreignKeys: [
          {
            columnNames: ["semester_id"],
            referencedTableName: "semesters",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
          {
            columnNames: ["professor_id"],
            referencedTableName: "professors",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
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
    const table = await queryRunner.getTable("disciplines");
    const professorFk = table?.foreignKeys.find((fk) => fk.columnNames.includes("professor_id"));
    if (professorFk) {
      await queryRunner.dropForeignKey("disciplines", professorFk);
    }

    await queryRunner.dropTable("disciplines");
    await queryRunner.dropTable("professors");
  }
}

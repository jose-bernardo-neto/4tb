import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateStudents1763500006000 implements MigrationInterface {
  name = "CreateStudents1763500006000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "students",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "contact", type: "varchar", isUnique: true },
          { name: "np", type: "varchar", isUnique: true },
          { name: "name", type: "varchar" },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("students");
  }
}

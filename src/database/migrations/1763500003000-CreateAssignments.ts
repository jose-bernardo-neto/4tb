import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAssignments1763500003000 implements MigrationInterface {
  name = "CreateAssignments1763500003000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "assignments",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "title", type: "varchar" },
          { name: "description", type: "varchar", default: "''" },
          { name: "type", type: "varchar" },
          { name: "due_date", type: "varchar" },
          { name: "discipline_id", type: "integer" },
          { name: "created_at", type: "datetime", default: "CURRENT_TIMESTAMP" },
        ],
        foreignKeys: [
          {
            columnNames: ["discipline_id"],
            referencedTableName: "disciplines",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: "assignment_attachments",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "assignment_id", type: "integer" },
          { name: "stored_name", type: "varchar" },
          { name: "original_name", type: "varchar" },
          { name: "mime_type", type: "varchar" },
          { name: "size", type: "integer" },
        ],
        foreignKeys: [
          {
            columnNames: ["assignment_id"],
            referencedTableName: "assignments",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("assignment_attachments");
    await queryRunner.dropTable("assignments");
  }
}

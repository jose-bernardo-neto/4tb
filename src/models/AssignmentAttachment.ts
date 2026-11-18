import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Assignment } from "./Assignment";

@Entity("assignment_attachments")
export class AssignmentAttachment {
  @PrimaryGeneratedColumn({ type: "integer" })
  id!: number;

  @Column({ type: "integer", name: "assignment_id" })
  assignmentId!: number;

  @ManyToOne(() => Assignment, (assignment) => assignment.attachments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "assignment_id" })
  assignment!: Assignment;

  @Column({ type: "varchar", name: "stored_name" })
  storedName!: string;

  @Column({ type: "varchar", name: "original_name" })
  originalName!: string;

  @Column({ type: "varchar", name: "mime_type" })
  mimeType!: string;

  @Column({ type: "integer" })
  size!: number;
}

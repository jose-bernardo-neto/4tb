import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AssignmentType } from "../domain/assignment";
import { AssignmentAttachment } from "./AssignmentAttachment";
import { Discipline } from "./Discipline";

@Entity("assignments")
export class Assignment {
  @PrimaryGeneratedColumn({ type: "integer" })
  id!: number;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "varchar", default: "" })
  description!: string;

  @Column({ type: "varchar" })
  type!: AssignmentType;

  @Column({ type: "varchar", name: "due_date" })
  dueDate!: string;

  @Column({ type: "integer", name: "discipline_id" })
  disciplineId!: number;

  @ManyToOne(() => Discipline, (discipline) => discipline.assignments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "discipline_id" })
  discipline!: Discipline;

  @OneToMany(() => AssignmentAttachment, (attachment) => attachment.assignment)
  attachments!: AssignmentAttachment[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}

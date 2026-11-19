import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Semester } from "./Semester";

@Entity("announcements")
export class Announcement {
  @PrimaryGeneratedColumn({ type: "integer" })
  id!: number;

  @Column({ type: "varchar" })
  title!: string;

  @Column({ type: "varchar" })
  body!: string;

  @Column({ type: "varchar" })
  date!: string;

  @Column({ type: "integer", name: "semester_id" })
  semesterId!: number;

  @ManyToOne(() => Semester, { onDelete: "CASCADE" })
  @JoinColumn({ name: "semester_id" })
  semester!: Semester;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}

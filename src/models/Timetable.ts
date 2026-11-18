import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Semester } from "./Semester";

@Entity("timetables")
export class Timetable {
  @PrimaryGeneratedColumn({ type: "integer" })
  id!: number;

  @Column({ type: "integer", name: "semester_id", unique: true })
  semesterId!: number;

  @OneToOne(() => Semester, (semester) => semester.timetable, { onDelete: "CASCADE" })
  @JoinColumn({ name: "semester_id" })
  semester!: Semester;

  @Column({ type: "varchar", default: "" })
  content!: string;

  @Column({ type: "varchar", name: "stored_name", nullable: true })
  storedName!: string | null;

  @Column({ type: "varchar", name: "original_name", nullable: true })
  originalName!: string | null;

  @Column({ type: "varchar", name: "mime_type", nullable: true })
  mimeType!: string | null;
}

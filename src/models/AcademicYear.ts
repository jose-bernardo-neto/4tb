import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Semester } from "./Semester";

@Entity("academic_years")
export class AcademicYear {
  @PrimaryGeneratedColumn({ type: "integer" })
  id!: number;

  @Column({ type: "varchar", unique: true })
  label!: string;

  @OneToMany(() => Semester, (semester) => semester.academicYear)
  semesters!: Semester[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}

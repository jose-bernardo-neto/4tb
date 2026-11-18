import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SemesterPeriod, SemesterStatus } from "../domain/academic";
import { AcademicYear } from "./AcademicYear";
import { Discipline } from "./Discipline";
import { Timetable } from "./Timetable";

@Entity("semesters")
export class Semester {
  @PrimaryGeneratedColumn({ type: "integer" })
  id!: number;

  @Column({ type: "integer", name: "academic_year_id" })
  academicYearId!: number;

  @ManyToOne(() => AcademicYear, (year) => year.semesters, { onDelete: "CASCADE" })
  @JoinColumn({ name: "academic_year_id" })
  academicYear!: AcademicYear;

  @Column({ type: "varchar" })
  period!: SemesterPeriod;

  @Column({ type: "varchar", default: SemesterStatus.INACTIVE })
  status!: SemesterStatus;

  @OneToMany(() => Discipline, (discipline) => discipline.semester)
  disciplines!: Discipline[];

  @OneToOne(() => Timetable, (timetable) => timetable.semester)
  timetable?: Timetable | null;
}

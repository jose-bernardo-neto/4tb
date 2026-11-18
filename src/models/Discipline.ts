import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Assignment } from "./Assignment";
import { Professor } from "./Professor";
import { Semester } from "./Semester";

@Entity("disciplines")
export class Discipline {
  @PrimaryGeneratedColumn({ type: "integer" })
  id!: number;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar" })
  acronym!: string;

  @Column({ type: "integer", name: "semester_id" })
  semesterId!: number;

  @ManyToOne(() => Semester, (semester) => semester.disciplines, { onDelete: "CASCADE" })
  @JoinColumn({ name: "semester_id" })
  semester!: Semester;

  @Column({ type: "integer", name: "professor_id" })
  professorId!: number;

  @ManyToOne(() => Professor, (professor) => professor.disciplines, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "professor_id" })
  professor!: Professor;

  @OneToMany(() => Assignment, (assignment) => assignment.discipline)
  assignments!: Assignment[];
}

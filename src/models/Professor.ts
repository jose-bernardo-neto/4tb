import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Discipline } from "./Discipline";

@Entity("professors")
export class Professor {
  @PrimaryGeneratedColumn({ type: "integer" })
  id!: number;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", name: "academic_degree" })
  academicDegree!: string;

  @Column({ type: "varchar" })
  contact!: string;

  @OneToMany(() => Discipline, (discipline) => discipline.professor)
  disciplines!: Discipline[];
}

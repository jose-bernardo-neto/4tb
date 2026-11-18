import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Semester } from "./Semester";

@Entity("fees")
export class Fee {
  @PrimaryGeneratedColumn({ type: "integer" })
  id!: number;

  @Column({ type: "varchar" })
  tipo!: string;

  @Column({ type: "varchar" })
  valor!: string;

  @Column({ type: "varchar" })
  prazo!: string;

  @Column({ type: "varchar", default: "" })
  obs!: string;

  @Column({ type: "integer", name: "semester_id" })
  semesterId!: number;

  @ManyToOne(() => Semester, { onDelete: "CASCADE" })
  @JoinColumn({ name: "semester_id" })
  semester!: Semester;
}

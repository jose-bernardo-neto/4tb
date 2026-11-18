import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("students")
export class Student {
  @PrimaryGeneratedColumn({ type: "integer" })
  id!: number;

  @Column({ type: "varchar", unique: true })
  contact!: string;

  @Column({ type: "varchar", unique: true })
  np!: string;

  @Column({ type: "varchar" })
  name!: string;
}

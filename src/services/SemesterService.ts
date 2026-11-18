import { Repository } from "typeorm";
import { MIN_DISCIPLINES_TO_ACTIVATE, SemesterStatus } from "../domain/academic";
import { AppError } from "../errors/AppError";
import { Discipline } from "../models/Discipline";
import { Semester } from "../models/Semester";

export class SemesterService {
  constructor(
    private readonly semesters: Repository<Semester>,
    private readonly disciplines: Repository<Discipline>,
  ) {}

  async getActive(): Promise<Semester | null> {
    return this.semesters.findOne({
      where: { status: SemesterStatus.ACTIVE },
      relations: { academicYear: true, disciplines: { professor: true } },
    });
  }

  async getById(id: number): Promise<Semester> {
    const semester = await this.semesters.findOne({
      where: { id },
      relations: { academicYear: true, disciplines: true },
    });

    if (!semester) {
      throw new AppError("Semestre não encontrado.", 404);
    }

    return semester;
  }

  async activate(id: number): Promise<Semester> {
    const semester = await this.getById(id);
    const count = await this.disciplines.count({ where: { semesterId: semester.id } });

    if (count < MIN_DISCIPLINES_TO_ACTIVATE) {
      throw new AppError(
        `Um semestre precisa de no mínimo ${MIN_DISCIPLINES_TO_ACTIVATE} cadeiras para ser ativado.`,
        400,
      );
    }

    await this.semesters.update({ status: SemesterStatus.ACTIVE }, { status: SemesterStatus.INACTIVE });
    semester.status = SemesterStatus.ACTIVE;
    return this.semesters.save(semester);
  }
}

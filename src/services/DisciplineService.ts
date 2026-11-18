import { Not, Repository } from "typeorm";
import { AppError } from "../errors/AppError";
import { Discipline } from "../models/Discipline";
import { Professor } from "../models/Professor";
import { Semester } from "../models/Semester";

export function normalizeAcronym(value: string): string {
  const acronym = value.trim().toUpperCase().replace(/\s+/g, "");
  if (!acronym) {
    throw new AppError("A sigla é obrigatória.", 400);
  }
  return acronym;
}

export class DisciplineService {
  constructor(
    private readonly disciplines: Repository<Discipline>,
    private readonly semesters: Repository<Semester>,
    private readonly professors: Repository<Professor>,
  ) {}

  async listBySemester(semesterId: number): Promise<Discipline[]> {
    await this.requireSemester(semesterId);
    return this.disciplines.find({
      where: { semesterId },
      relations: { professor: true, semester: { academicYear: true } },
      order: { acronym: "ASC" },
    });
  }

  async getById(id: number): Promise<Discipline> {
    const discipline = await this.disciplines.findOne({
      where: { id },
      relations: {
        professor: true,
        semester: { academicYear: true },
        assignments: { attachments: true },
      },
    });

    if (!discipline) {
      throw new AppError("Cadeira não encontrada.", 404);
    }

    return discipline;
  }

  async create(input: {
    name: string;
    acronym: string;
    semesterId: number;
    professorId: number;
  }): Promise<Discipline> {
    const semester = await this.requireSemester(input.semesterId);
    await this.requireProfessor(input.professorId);

    const name = input.name.trim();
    if (!name) {
      throw new AppError("O nome da cadeira é obrigatório.", 400);
    }

    const acronym = normalizeAcronym(input.acronym);
    await this.assertUniqueAcronym(semester.id, acronym);

    const discipline = this.disciplines.create({
      name,
      acronym,
      semesterId: semester.id,
      professorId: input.professorId,
    });

    return this.disciplines.save(discipline);
  }

  async update(
    id: number,
    input: { name: string; acronym: string; professorId: number },
  ): Promise<Discipline> {
    const discipline = await this.getById(id);
    const name = input.name.trim();
    if (!name) {
      throw new AppError("O nome da cadeira é obrigatório.", 400);
    }

    await this.requireProfessor(input.professorId);
    const acronym = normalizeAcronym(input.acronym);
    await this.assertUniqueAcronym(discipline.semesterId, acronym, discipline.id);

    discipline.name = name;
    discipline.acronym = acronym;
    discipline.professorId = input.professorId;
    await this.disciplines.save(discipline);
    return this.getById(id);
  }

  async remove(id: number): Promise<Discipline> {
    const discipline = await this.getById(id);
    await this.disciplines.remove(discipline);
    return discipline;
  }

  private async requireSemester(id: number): Promise<Semester> {
    const semester = await this.semesters.findOne({
      where: { id },
      relations: { academicYear: true },
    });
    if (!semester) {
      throw new AppError("Semestre não encontrado.", 404);
    }
    return semester;
  }

  private async requireProfessor(id: number): Promise<Professor> {
    const professor = await this.professors.findOne({ where: { id } });
    if (!professor) {
      throw new AppError("Professor não encontrado.", 400);
    }
    return professor;
  }

  private async assertUniqueAcronym(semesterId: number, acronym: string, exceptId?: number): Promise<void> {
    const existing = await this.disciplines.findOne({
      where: exceptId
        ? { semesterId, acronym, id: Not(exceptId) }
        : { semesterId, acronym },
    });

    if (existing) {
      throw new AppError("Já existe uma cadeira com essa sigla neste semestre.", 400);
    }
  }
}

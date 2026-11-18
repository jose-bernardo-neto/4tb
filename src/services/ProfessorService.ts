import { Repository } from "typeorm";
import { AppError } from "../errors/AppError";
import { Discipline } from "../models/Discipline";
import { Professor } from "../models/Professor";

function requiredText(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new AppError(`O campo ${field} é obrigatório.`, 400);
  }
  return trimmed;
}

export class ProfessorService {
  constructor(
    private readonly professors: Repository<Professor>,
    private readonly disciplines: Repository<Discipline>,
  ) {}

  list(): Promise<Professor[]> {
    return this.professors.find({
      relations: { disciplines: true },
      order: { name: "ASC" },
    });
  }

  async getById(id: number): Promise<Professor> {
    const professor = await this.professors.findOne({
      where: { id },
      relations: { disciplines: { semester: { academicYear: true } } },
    });

    if (!professor) {
      throw new AppError("Professor não encontrado.", 404);
    }

    return professor;
  }

  async create(input: { name: string; academicDegree: string; contact: string }): Promise<Professor> {
    const professor = this.professors.create({
      name: requiredText(input.name, "nome"),
      academicDegree: requiredText(input.academicDegree, "grau académico"),
      contact: requiredText(input.contact, "contacto"),
    });

    return this.professors.save(professor);
  }

  async update(
    id: number,
    input: { name: string; academicDegree: string; contact: string },
  ): Promise<Professor> {
    const professor = await this.getById(id);
    professor.name = requiredText(input.name, "nome");
    professor.academicDegree = requiredText(input.academicDegree, "grau académico");
    professor.contact = requiredText(input.contact, "contacto");
    await this.professors.save(professor);
    return this.getById(id);
  }

  async remove(id: number): Promise<void> {
    const professor = await this.getById(id);
    const linked = await this.disciplines.count({ where: { professorId: id } });
    if (linked > 0) {
      throw new AppError("Não é possível apagar um professor com cadeiras associadas.", 400);
    }

    await this.professors.remove(professor);
  }
}

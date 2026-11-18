import { Repository } from "typeorm";
import { ACADEMIC_YEAR_LABEL_EXAMPLE, SemesterPeriod, SemesterStatus } from "../domain/academic";
import { AppError } from "../errors/AppError";
import { AcademicYear } from "../models/AcademicYear";
import { Semester } from "../models/Semester";

const LABEL_PATTERN = /^(\d{4})\/(\d{4})$/;

export function normalizeAcademicYearLabel(label: string): string {
  const trimmed = label.trim();
  const match = LABEL_PATTERN.exec(trimmed);
  if (!match) {
    throw new AppError(`O ano letivo deve ter o formato ${ACADEMIC_YEAR_LABEL_EXAMPLE}.`, 400);
  }

  const start = Number(match[1]);
  const end = Number(match[2]);
  if (end !== start + 1) {
    throw new AppError(
      `O segundo ano deve ser o seguinte ao primeiro (ex.: ${ACADEMIC_YEAR_LABEL_EXAMPLE}).`,
      400,
    );
  }

  return `${start}/${end}`;
}

export class AcademicYearService {
  constructor(
    private readonly years: Repository<AcademicYear>,
    private readonly semesters: Repository<Semester>,
  ) {}

  list(): Promise<AcademicYear[]> {
    return this.years.find({
      relations: { semesters: true },
      order: { label: "DESC" },
    });
  }

  async getById(id: number): Promise<AcademicYear> {
    const year = await this.years.findOne({
      where: { id },
      relations: { semesters: { disciplines: { professor: true } } },
    });

    if (!year) {
      throw new AppError("Ano letivo não encontrado.", 404);
    }

    year.semesters.sort((a, b) => {
      if (a.period === b.period) return 0;
      return a.period === SemesterPeriod.FIRST ? -1 : 1;
    });

    return year;
  }

  async create(label: string): Promise<AcademicYear> {
    const normalized = normalizeAcademicYearLabel(label);
    const existing = await this.years.findOne({ where: { label: normalized } });
    if (existing) {
      throw new AppError("Já existe um ano letivo com esse rótulo.", 400);
    }

    const year = await this.years.save(this.years.create({ label: normalized }));

    await this.semesters.save([
      this.semesters.create({
        academicYearId: year.id,
        period: SemesterPeriod.FIRST,
        status: SemesterStatus.INACTIVE,
      }),
      this.semesters.create({
        academicYearId: year.id,
        period: SemesterPeriod.SECOND,
        status: SemesterStatus.INACTIVE,
      }),
    ]);

    return this.getById(year.id);
  }

  async update(id: number, label: string): Promise<AcademicYear> {
    const year = await this.getById(id);
    const normalized = normalizeAcademicYearLabel(label);

    if (normalized !== year.label) {
      const existing = await this.years.findOne({ where: { label: normalized } });
      if (existing) {
        throw new AppError("Já existe um ano letivo com esse rótulo.", 400);
      }
    }

    year.label = normalized;
    await this.years.save(year);
    return this.getById(year.id);
  }

  async remove(id: number): Promise<void> {
    const year = await this.getById(id);
    const hasActive = year.semesters.some((semester) => semester.status === SemesterStatus.ACTIVE);
    if (hasActive) {
      throw new AppError("Não é possível apagar um ano letivo com o semestre activo.", 400);
    }

    await this.years.remove(year);
  }
}

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AppDataSource } from "../config/data-source";
import { SemesterPeriod, SemesterStatus } from "../domain/academic";
import { AppError } from "../errors/AppError";
import { AcademicYear } from "../models/AcademicYear";
import { Discipline } from "../models/Discipline";
import { Professor } from "../models/Professor";
import { Semester } from "../models/Semester";
import { clearAcademicData, setupTestDb, teardownTestDb } from "../test/db";
import { AcademicYearService } from "./AcademicYearService";
import { SemesterService } from "./SemesterService";

describe("SemesterService", () => {
  let years: AcademicYearService;
  let semesters: SemesterService;

  beforeAll(async () => {
    await setupTestDb();
    years = new AcademicYearService(
      AppDataSource.getRepository(AcademicYear),
      AppDataSource.getRepository(Semester),
    );
    semesters = new SemesterService(
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Discipline),
    );
  });

  beforeEach(async () => {
    await clearAcademicData();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  async function addDisciplines(semesterId: number, count: number): Promise<void> {
    const professors = AppDataSource.getRepository(Professor);
    const professor = await professors.save(
      professors.create({
        name: "Docente Teste",
        academicDegree: "Mestre",
        contact: "docente@teste.ao",
      }),
    );
    const repo = AppDataSource.getRepository(Discipline);
    for (let i = 0; i < count; i += 1) {
      await repo.save(
        repo.create({
          name: `Cadeira ${i + 1}`,
          acronym: `C${i + 1}`,
          semesterId,
          professorId: professor.id,
        }),
      );
    }
  }

  it("bloqueia activação com menos de 3 cadeiras", async () => {
    const year = await years.create("2025/2026");
    const first = year.semesters.find((item) => item.period === SemesterPeriod.FIRST)!;

    await expect(semesters.activate(first.id)).rejects.toBeInstanceOf(AppError);

    await addDisciplines(first.id, 2);
    await expect(semesters.activate(first.id)).rejects.toMatchObject({
      message: "Um semestre precisa de no mínimo 3 cadeiras para ser ativado.",
    });
  });

  it("activa com 3 cadeiras e garante um único semestre activo", async () => {
    const year = await years.create("2025/2026");
    const first = year.semesters.find((item) => item.period === SemesterPeriod.FIRST)!;
    const second = year.semesters.find((item) => item.period === SemesterPeriod.SECOND)!;

    await addDisciplines(first.id, 3);
    await addDisciplines(second.id, 3);

    const activated = await semesters.activate(first.id);
    expect(activated.status).toBe(SemesterStatus.ACTIVE);

    const switched = await semesters.activate(second.id);
    expect(switched.status).toBe(SemesterStatus.ACTIVE);

    const previous = await semesters.getById(first.id);
    expect(previous.status).toBe(SemesterStatus.INACTIVE);

    const activeCount = await AppDataSource.getRepository(Semester).count({
      where: { status: SemesterStatus.ACTIVE },
    });
    expect(activeCount).toBe(1);
  });
});

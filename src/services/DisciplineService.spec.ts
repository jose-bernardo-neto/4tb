import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AppDataSource } from "../config/data-source";
import { SemesterPeriod, SemesterStatus } from "../domain/academic";
import { AcademicYear } from "../models/AcademicYear";
import { Discipline } from "../models/Discipline";
import { Professor } from "../models/Professor";
import { Semester } from "../models/Semester";
import { clearAcademicData, setupTestDb, teardownTestDb } from "../test/db";
import { AcademicYearService } from "./AcademicYearService";
import { DisciplineService, normalizeAcronym } from "./DisciplineService";
import { ProfessorService } from "./ProfessorService";
import { SemesterService } from "./SemesterService";

describe("DisciplineService", () => {
  let years: AcademicYearService;
  let professors: ProfessorService;
  let disciplines: DisciplineService;
  let semesters: SemesterService;

  beforeAll(async () => {
    await setupTestDb();
    years = new AcademicYearService(
      AppDataSource.getRepository(AcademicYear),
      AppDataSource.getRepository(Semester),
    );
    professors = new ProfessorService(
      AppDataSource.getRepository(Professor),
      AppDataSource.getRepository(Discipline),
    );
    disciplines = new DisciplineService(
      AppDataSource.getRepository(Discipline),
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Professor),
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

  it("normaliza a sigla para maiúsculas", () => {
    expect(normalizeAcronym(" am ")).toBe("AM");
  });

  it("rejeita sigla duplicada no mesmo semestre e aceita noutro", async () => {
    const professor = await professors.create({
      name: "Carlos",
      academicDegree: "Mestre",
      contact: "carlos@faculdade.ao",
    });
    const year = await years.create("2025/2026");
    const first = year.semesters.find((item) => item.period === SemesterPeriod.FIRST)!;
    const second = year.semesters.find((item) => item.period === SemesterPeriod.SECOND)!;

    await disciplines.create({
      name: "Análise Matemática",
      acronym: "am",
      semesterId: first.id,
      professorId: professor.id,
    });

    await expect(
      disciplines.create({
        name: "Análise II",
        acronym: "AM",
        semesterId: first.id,
        professorId: professor.id,
      }),
    ).rejects.toMatchObject({
      message: "Já existe uma cadeira com essa sigla neste semestre.",
    });

    const other = await disciplines.create({
      name: "Análise Matemática",
      acronym: "AM",
      semesterId: second.id,
      professorId: professor.id,
    });
    expect(other.acronym).toBe("AM");
  });

  it("permite activar o semestre depois de 3 cadeiras", async () => {
    const professor = await professors.create({
      name: "Carlos",
      academicDegree: "Mestre",
      contact: "carlos@faculdade.ao",
    });
    const year = await years.create("2025/2026");
    const first = year.semesters.find((item) => item.period === SemesterPeriod.FIRST)!;

    await disciplines.create({
      name: "Análise Matemática",
      acronym: "AM",
      semesterId: first.id,
      professorId: professor.id,
    });
    await disciplines.create({
      name: "Álgebra Linear",
      acronym: "AL",
      semesterId: first.id,
      professorId: professor.id,
    });
    await disciplines.create({
      name: "Técnicas de Comunicação",
      acronym: "TCE",
      semesterId: first.id,
      professorId: professor.id,
    });

    const activated = await semesters.activate(first.id);
    expect(activated.status).toBe(SemesterStatus.ACTIVE);
  });
});

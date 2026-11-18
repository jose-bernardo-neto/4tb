import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AppDataSource } from "../config/data-source";
import { AcademicYear } from "../models/AcademicYear";
import { Discipline } from "../models/Discipline";
import { Professor } from "../models/Professor";
import { Semester } from "../models/Semester";
import { clearAcademicData, setupTestDb, teardownTestDb } from "../test/db";
import { AcademicYearService } from "./AcademicYearService";
import { DisciplineService } from "./DisciplineService";
import { ProfessorService } from "./ProfessorService";

describe("ProfessorService", () => {
  let professors: ProfessorService;
  let disciplines: DisciplineService;
  let years: AcademicYearService;

  beforeAll(async () => {
    await setupTestDb();
    professors = new ProfessorService(
      AppDataSource.getRepository(Professor),
      AppDataSource.getRepository(Discipline),
    );
    disciplines = new DisciplineService(
      AppDataSource.getRepository(Discipline),
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Professor),
    );
    years = new AcademicYearService(
      AppDataSource.getRepository(AcademicYear),
      AppDataSource.getRepository(Semester),
    );
  });

  beforeEach(async () => {
    await clearAcademicData();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it("impede apagar professor com cadeiras e permite 1:N", async () => {
    const professor = await professors.create({
      name: "Ana Silva",
      academicDegree: "Doutora",
      contact: "ana@faculdade.ao",
    });
    const year = await years.create("2025/2026");
    const semesterId = year.semesters[0].id;

    await disciplines.create({
      name: "Análise Matemática",
      acronym: "AM",
      semesterId,
      professorId: professor.id,
    });
    await disciplines.create({
      name: "Álgebra Linear",
      acronym: "AL",
      semesterId,
      professorId: professor.id,
    });

    const loaded = await professors.getById(professor.id);
    expect(loaded.disciplines).toHaveLength(2);

    await expect(professors.remove(professor.id)).rejects.toMatchObject({
      message: "Não é possível apagar um professor com cadeiras associadas.",
    });
  });
});

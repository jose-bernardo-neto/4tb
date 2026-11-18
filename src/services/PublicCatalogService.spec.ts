import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AppDataSource } from "../config/data-source";
import { AssignmentType } from "../domain/assignment";
import { AcademicYear } from "../models/AcademicYear";
import { Announcement } from "../models/Announcement";
import { Assignment } from "../models/Assignment";
import { AssignmentAttachment } from "../models/AssignmentAttachment";
import { Discipline } from "../models/Discipline";
import { Fee } from "../models/Fee";
import { Professor } from "../models/Professor";
import { Semester } from "../models/Semester";
import { clearAcademicData, setupTestDb, teardownTestDb } from "../test/db";
import { AcademicYearService } from "./AcademicYearService";
import { AssignmentService } from "./AssignmentService";
import { DisciplineService } from "./DisciplineService";
import { ProfessorService } from "./ProfessorService";
import { PublicCatalogService } from "./PublicCatalogService";
import { SemesterService } from "./SemesterService";

describe("PublicCatalogService", () => {
  let years: AcademicYearService;
  let professors: ProfessorService;
  let disciplines: DisciplineService;
  let assignments: AssignmentService;
  let semesters: SemesterService;
  let catalog: PublicCatalogService;

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
    assignments = new AssignmentService(
      AppDataSource.getRepository(Assignment),
      AppDataSource.getRepository(AssignmentAttachment),
      AppDataSource.getRepository(Discipline),
    );
    semesters = new SemesterService(
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Discipline),
    );
    catalog = new PublicCatalogService(
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Discipline),
      AppDataSource.getRepository(Assignment),
      AppDataSource.getRepository(AssignmentAttachment),
      AppDataSource.getRepository(Announcement),
      AppDataSource.getRepository(Fee),
    );
  });

  beforeEach(async () => {
    await clearAcademicData();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it("só mostra dados do semestre activo", async () => {
    const professor = await professors.create({
      name: "Ana",
      academicDegree: "Mestre",
      contact: "ana@faculdade.ao",
    });
    const year = await years.create("2025/2026");
    const first = year.semesters[0];
    const second = year.semesters[1];

    const am = await disciplines.create({
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
      name: "TCE",
      acronym: "TCE",
      semesterId: first.id,
      professorId: professor.id,
    });
    await disciplines.create({
      name: "Redes",
      acronym: "RC",
      semesterId: second.id,
      professorId: professor.id,
    });

    await assignments.create({
      title: "Lista AM",
      description: "",
      type: AssignmentType.WORK,
      dueDate: "2026-03-10",
      disciplineId: am.id,
    });

    await expect(catalog.listDisciplines()).rejects.toMatchObject({
      message: "Não há semestre activo.",
    });

    await semesters.activate(first.id);

    const listed = await catalog.listDisciplines();
    expect(listed.map((item) => item.acronym)).toEqual(["AL", "AM", "TCE"]);
    expect(await catalog.listProfessors()).toHaveLength(1);
    expect((await catalog.listAssignments()).map((item) => item.title)).toEqual(["Lista AM"]);
  });
});

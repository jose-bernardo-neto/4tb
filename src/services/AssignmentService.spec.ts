import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AppDataSource } from "../config/data-source";
import { AssignmentType } from "../domain/assignment";
import { AcademicYear } from "../models/AcademicYear";
import { Assignment } from "../models/Assignment";
import { AssignmentAttachment } from "../models/AssignmentAttachment";
import { Discipline } from "../models/Discipline";
import { Professor } from "../models/Professor";
import { Semester } from "../models/Semester";
import { clearAcademicData, setupTestDb, teardownTestDb } from "../test/db";
import { AcademicYearService } from "./AcademicYearService";
import { AssignmentService } from "./AssignmentService";
import { DisciplineService } from "./DisciplineService";
import { ProfessorService } from "./ProfessorService";

describe("AssignmentService", () => {
  let years: AcademicYearService;
  let professors: ProfessorService;
  let disciplines: DisciplineService;
  let assignments: AssignmentService;

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
  });

  beforeEach(async () => {
    await clearAcademicData();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  async function seedDiscipline() {
    const professor = await professors.create({
      name: "Ana",
      academicDegree: "Mestre",
      contact: "ana@faculdade.ao",
    });
    const year = await years.create("2025/2026");
    const semester = year.semesters[0];
    const discipline = await disciplines.create({
      name: "Análise Matemática",
      acronym: "AM",
      semesterId: semester.id,
      professorId: professor.id,
    });
    return { semester, discipline };
  }

  it("rejeita tipo inválido", async () => {
    const { discipline } = await seedDiscipline();
    await expect(
      assignments.create({
        title: "Lista 1",
        description: "",
        type: "seminario",
        dueDate: "2026-03-10",
        disciplineId: discipline.id,
      }),
    ).rejects.toMatchObject({
      message: "O tipo deve ser: trabalho, prova, projeto.",
    });
  });

  it("cria e lista por cadeira e por semestre", async () => {
    const { semester, discipline } = await seedDiscipline();

    await assignments.create({
      title: "Lista 1",
      description: "Exercícios",
      type: AssignmentType.WORK,
      dueDate: "2026-03-10",
      disciplineId: discipline.id,
    });
    await assignments.create({
      title: "Prova 1",
      description: "",
      type: AssignmentType.EXAM,
      dueDate: "2026-04-01",
      disciplineId: discipline.id,
    });

    const byDiscipline = await assignments.listByDiscipline(discipline.id);
    const bySemester = await assignments.listBySemester(semester.id);

    expect(byDiscipline).toHaveLength(2);
    expect(bySemester.map((item) => item.title)).toEqual(["Lista 1", "Prova 1"]);
    expect(bySemester[0].discipline.acronym).toBe("AM");
  });
});

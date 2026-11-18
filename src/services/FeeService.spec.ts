import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AppDataSource } from "../config/data-source";
import { AcademicYear } from "../models/AcademicYear";
import { Fee } from "../models/Fee";
import { Semester } from "../models/Semester";
import { clearAcademicData, setupTestDb, teardownTestDb } from "../test/db";
import { AcademicYearService } from "./AcademicYearService";
import { FeeService } from "./FeeService";

describe("FeeService", () => {
  let years: AcademicYearService;
  let fees: FeeService;

  beforeAll(async () => {
    await setupTestDb();
    years = new AcademicYearService(
      AppDataSource.getRepository(AcademicYear),
      AppDataSource.getRepository(Semester),
    );
    fees = new FeeService(AppDataSource.getRepository(Fee), AppDataSource.getRepository(Semester));
  });

  beforeEach(async () => {
    await clearAcademicData();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it("cria a tabela estruturada de emolumentos", async () => {
    const year = await years.create("2025/2026");
    const semesterId = year.semesters[0].id;

    await fees.create({
      semesterId,
      tipo: "Propina",
      valor: "15000",
      prazo: "2026-03-15",
      obs: "1.ª prestação",
    });

    const listed = await fees.listBySemester(semesterId);
    expect(listed).toHaveLength(1);
    expect(listed[0]).toMatchObject({
      tipo: "Propina",
      valor: "15000",
      prazo: "2026-03-15",
      obs: "1.ª prestação",
    });
  });
});

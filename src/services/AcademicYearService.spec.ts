import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { SemesterPeriod, SemesterStatus } from "../domain/academic";
import { AppError } from "../errors/AppError";
import { AcademicYear } from "../models/AcademicYear";
import { Semester } from "../models/Semester";
import { clearAcademicData, setupTestDb, teardownTestDb } from "../test/db";
import { AppDataSource } from "../config/data-source";
import { AcademicYearService, normalizeAcademicYearLabel } from "./AcademicYearService";

describe("AcademicYearService", () => {
  let service: AcademicYearService;

  beforeAll(async () => {
    await setupTestDb();
    service = new AcademicYearService(
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

  it("normaliza o rótulo 2025/2026 e rejeita formatos inválidos", () => {
    expect(normalizeAcademicYearLabel(" 2025/2026 ")).toBe("2025/2026");
    expect(() => normalizeAcademicYearLabel("2025")).toThrow(AppError);
    expect(() => normalizeAcademicYearLabel("2025/2027")).toThrow(AppError);
  });

  it("cria o ano com 1.º e 2.º semestre inactivos", async () => {
    const year = await service.create("2025/2026");
    expect(year.semesters).toHaveLength(2);
    expect(year.semesters.map((item) => item.period).sort()).toEqual([
      SemesterPeriod.FIRST,
      SemesterPeriod.SECOND,
    ]);
    expect(year.semesters.every((item) => item.status === SemesterStatus.INACTIVE)).toBe(true);
  });

  it("não permite rótulo duplicado", async () => {
    await service.create("2025/2026");
    await expect(service.create("2025/2026")).rejects.toBeInstanceOf(AppError);
  });

  it("impede apagar um ano com semestre activo", async () => {
    const year = await service.create("2025/2026");
    const first = year.semesters.find((item) => item.period === SemesterPeriod.FIRST)!;
    first.status = SemesterStatus.ACTIVE;
    await AppDataSource.getRepository(Semester).save(first);

    await expect(service.remove(year.id)).rejects.toMatchObject({
      message: "Não é possível apagar um ano letivo com o semestre activo.",
    });
  });
});

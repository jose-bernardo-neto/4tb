import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AppDataSource } from "../config/data-source";
import { AcademicYear } from "../models/AcademicYear";
import { Semester } from "../models/Semester";
import { Timetable } from "../models/Timetable";
import { clearAcademicData, setupTestDb, teardownTestDb } from "../test/db";
import { AcademicYearService } from "./AcademicYearService";
import { TimetableService } from "./TimetableService";

describe("TimetableService", () => {
  let years: AcademicYearService;
  let timetables: TimetableService;

  beforeAll(async () => {
    await setupTestDb();
    years = new AcademicYearService(
      AppDataSource.getRepository(AcademicYear),
      AppDataSource.getRepository(Semester),
    );
    timetables = new TimetableService(
      AppDataSource.getRepository(Timetable),
      AppDataSource.getRepository(Semester),
    );
  });

  beforeEach(async () => {
    await clearAcademicData();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it("guarda texto e substitui o ficheiro", async () => {
    const year = await years.create("2025/2026");
    const semesterId = year.semesters[0].id;

    const first = await timetables.save({
      semesterId,
      content: "Segunda: AM 08h",
      file: {
        storedName: "a.png",
        originalName: "horario.png",
        mimeType: "image/png",
        size: 10,
      },
    });
    expect(first.content).toBe("Segunda: AM 08h");
    expect(first.originalName).toBe("horario.png");

    const second = await timetables.save({
      semesterId,
      content: "Terça: AL 10h",
      file: {
        storedName: "b.pdf",
        originalName: "grade.pdf",
        mimeType: "application/pdf",
        size: 20,
      },
    });

    expect(second.id).toBe(first.id);
    expect(second.content).toBe("Terça: AL 10h");
    expect(second.originalName).toBe("grade.pdf");
    expect(second.mimeType).toBe("application/pdf");
  });
});

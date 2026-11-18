import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AppDataSource } from "../config/data-source";
import { AcademicYear } from "../models/AcademicYear";
import { Announcement } from "../models/Announcement";
import { Semester } from "../models/Semester";
import { clearAcademicData, setupTestDb, teardownTestDb } from "../test/db";
import { AcademicYearService } from "./AcademicYearService";
import { AnnouncementService } from "./AnnouncementService";

describe("AnnouncementService", () => {
  let years: AcademicYearService;
  let announcements: AnnouncementService;

  beforeAll(async () => {
    await setupTestDb();
    years = new AcademicYearService(
      AppDataSource.getRepository(AcademicYear),
      AppDataSource.getRepository(Semester),
    );
    announcements = new AnnouncementService(
      AppDataSource.getRepository(Announcement),
      AppDataSource.getRepository(Semester),
    );
  });

  beforeEach(async () => {
    await clearAcademicData();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it("cria e lista comunicados só do semestre", async () => {
    const year = await years.create("2025/2026");
    const first = year.semesters[0];
    const second = year.semesters[1];

    await announcements.create({
      semesterId: first.id,
      title: "Aula suspensa",
      body: "Não haverá aula na sexta.",
      date: "2026-03-10",
    });
    await announcements.create({
      semesterId: second.id,
      title: "Outro semestre",
      body: "Não deve aparecer.",
      date: "2026-08-01",
    });

    const listed = await announcements.listBySemester(first.id);
    expect(listed).toHaveLength(1);
    expect(listed[0].title).toBe("Aula suspensa");
  });
});

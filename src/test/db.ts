import { AppDataSource, databaseAdapter } from "../config/data-source";

export async function setupTestDb(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    await databaseAdapter.afterInitialize(AppDataSource);
    await AppDataSource.runMigrations();
  }
}

export async function clearAcademicData(): Promise<void> {
  await AppDataSource.query("DELETE FROM students");
  await AppDataSource.query("DELETE FROM assignment_attachments");
  await AppDataSource.query("DELETE FROM assignments");
  await AppDataSource.query("DELETE FROM timetables");
  await AppDataSource.query("DELETE FROM announcements");
  await AppDataSource.query("DELETE FROM fees");
  await AppDataSource.query("DELETE FROM disciplines");
  await AppDataSource.query("DELETE FROM professors");
  await AppDataSource.query("DELETE FROM semesters");
  await AppDataSource.query("DELETE FROM academic_years");
}

export async function teardownTestDb(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
}

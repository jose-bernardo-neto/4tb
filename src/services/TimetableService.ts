import fs from "node:fs/promises";
import path from "node:path";
import { Repository } from "typeorm";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import { Semester } from "../models/Semester";
import { Timetable } from "../models/Timetable";
import { UploadedAttachment } from "./AssignmentService";

export class TimetableService {
  constructor(
    private readonly timetables: Repository<Timetable>,
    private readonly semesters: Repository<Semester>,
  ) {}

  async getBySemester(semesterId: number): Promise<Timetable | null> {
    await this.requireSemester(semesterId);
    return this.timetables.findOne({
      where: { semesterId },
      relations: { semester: { academicYear: true } },
    });
  }

  async save(input: {
    semesterId: number;
    content: string;
    file?: UploadedAttachment;
    removeFile?: boolean;
  }): Promise<Timetable> {
    await this.requireSemester(input.semesterId);
    const existing = await this.timetables.findOne({ where: { semesterId: input.semesterId } });
    const timetable =
      existing ??
      this.timetables.create({
        semesterId: input.semesterId,
        content: "",
        storedName: null,
        originalName: null,
        mimeType: null,
      });

    timetable.content = input.content.trim();

    if (input.removeFile && timetable.storedName) {
      await this.deleteStoredFile(timetable);
      timetable.storedName = null;
      timetable.originalName = null;
      timetable.mimeType = null;
    }

    if (input.file) {
      if (timetable.storedName) {
        await this.deleteStoredFile(timetable);
      }
      timetable.storedName = path.basename(input.file.storedName);
      timetable.originalName = input.file.originalName;
      timetable.mimeType = input.file.mimeType;
    }

    return this.timetables.save(timetable);
  }

  filePath(timetable: Timetable): string {
    if (!timetable.storedName) {
      throw new AppError("Este horário não tem ficheiro.", 404);
    }
    return path.join(env.UPLOAD_DIR, path.basename(timetable.storedName));
  }

  private async requireSemester(id: number): Promise<Semester> {
    const semester = await this.semesters.findOne({
      where: { id },
      relations: { academicYear: true },
    });
    if (!semester) {
      throw new AppError("Semestre não encontrado.", 404);
    }
    return semester;
  }

  private async deleteStoredFile(timetable: Timetable): Promise<void> {
    if (!timetable.storedName) {
      return;
    }
    try {
      await fs.unlink(this.filePath(timetable));
    } catch {
      // o ficheiro pode já ter sido removido
    }
  }
}
